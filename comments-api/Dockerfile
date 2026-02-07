# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install git for fetch dependencies
RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build static binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /comments-api .

# Final stage
FROM alpine:latest

WORKDIR /app

# Install CA certificates for HTTPS requests if needed (good practice)
RUN apk --no-cache add ca-certificates

COPY --from=builder /comments-api /app/comments-api

EXPOSE 8080

CMD ["/app/comments-api"]
