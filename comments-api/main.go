package main

import (
	"context"
	_ "embed"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

//go:embed dashboard/index.html
var dashboardHTML []byte

type Comment struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Slug      string             `bson:"slug" json:"slug"`
	Author    string             `bson:"author" json:"author"`
	Content   string             `bson:"content" json:"content"`
	Status    string             `bson:"status" json:"status"` // pending, approved, rejected
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

var client *mongo.Client
var collection *mongo.Collection

func main() {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://mongo:27017"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var err error
	client, err = mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal(err)
	}

	// Ping the database
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Printf("Could not connect to MongoDB: %v\n", err)
	} else {
		log.Println("Connected to MongoDB!")
	}

	collection = client.Database("blog_comments").Collection("comments")

	// Public Routes
	http.HandleFunc("/comments", handleComments) // GET (approved only), POST (create pending)

	// Admin Routes
	http.HandleFunc("/dashboard", authMiddleware(handleDashboard))
	http.HandleFunc("/admin/pending", authMiddleware(handleAdminPending))
	http.HandleFunc("/admin/approve", authMiddleware(handleAdminApprove))
	http.HandleFunc("/admin/reject", authMiddleware(handleAdminReject))

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s\n", port)
	log.Printf("Dashboard available at http://localhost:%s/dashboard\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

// Middleware for Basic Auth
func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		adminUser := os.Getenv("ADMIN_USER")
		adminPass := os.Getenv("ADMIN_PASSWORD")

		if adminUser == "" {
			adminUser = "admin"
		}
		if adminPass == "" {
			adminPass = "admin" // Default for dev, user should set env var
		}

		user, pass, ok := r.BasicAuth()
		if !ok || user != adminUser || pass != adminPass {
			w.Header().Set("WWW-Authenticate", `Basic realm="Restricted"`)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next(w, r)
	}
}

func handleDashboard(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")
	w.Write(dashboardHTML)
}

func handleComments(w http.ResponseWriter, r *http.Request) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method == http.MethodPost {
		createComment(w, r)
		return
	}

	if r.Method == http.MethodGet {
		getComments(w, r) // Only approved
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}

func createComment(w http.ResponseWriter, r *http.Request) {
	var comment Comment
	if err := json.NewDecoder(r.Body).Decode(&comment); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if comment.Slug == "" || comment.Author == "" || comment.Content == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	comment.CreatedAt = time.Now()
	comment.Status = "pending" // Default status

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := collection.InsertOne(ctx, comment)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Comment submitted for moderation",
		"id":      result.InsertedID,
	})
}

func getComments(w http.ResponseWriter, r *http.Request) {
	slug := r.URL.Query().Get("slug")
	if slug == "" {
		http.Error(w, "Missing slug query parameter", http.StatusBadRequest)
		return
	}

	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page := 1
	limit := 10

	if pageStr != "" {
		p, err := strconv.Atoi(pageStr)
		if err == nil && p > 0 {
			page = p
		}
	}
	if limitStr != "" {
		l, err := strconv.Atoi(limitStr)
		if err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	skip := int64((page - 1) * limit)
	limit64 := int64(limit)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Filter by slug AND status="approved"
	filter := bson.M{
		"slug":   slug,
		"status": "approved",
	}

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetSkip(skip).SetLimit(limit64)

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var comments []Comment
	if err = cursor.All(ctx, &comments); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if comments == nil {
		comments = []Comment{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

func handleAdminPending(w http.ResponseWriter, r *http.Request) {
	// CORS for Admin (if accessing from different origin, but dashboard is same origin usually)
	// Adding simple CORS just in case
	w.Header().Set("Access-Control-Allow-Origin", "*")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"status": "pending"}

	cursor, err := collection.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "createdAt", Value: 1}})) // Oldest first for moderation? Or newest? Let's do oldest first to clear backlog.
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var comments []Comment
	if err = cursor.All(ctx, &comments); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if comments == nil {
		comments = []Comment{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

func handleAdminApprove(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Missing id", http.StatusBadRequest)
		return
	}

	// Convert string ID to ObjectID
	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"_id": objID}
	update := bson.M{"$set": bson.M{"status": "approved"}}

	_, err = collection.UpdateOne(ctx, filter, update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Approved"))
}

func handleAdminReject(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Missing id", http.StatusBadRequest)
		return
	}

	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Permanently delete or set to rejected?
	// User said "validate... to show". Rejected usually means spam.
	// I'll set status to 'rejected' to keep record, but user might want delete.
	// Let's set to 'rejected' for now.
	filter := bson.M{"_id": objID}
	update := bson.M{"$set": bson.M{"status": "rejected"}}

	_, err = collection.UpdateOne(ctx, filter, update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Rejected"))
}
