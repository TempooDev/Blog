---
title: Building Scalable Hotel Reservation Systems with .NET Aspire and Azure
publishDate: 2025-04-06 19:00:00
img: /assets/booking-architecture.png
img_alt: A bright pink sheet of paper used to wrap flowers curves in front of rich blue background
description: |
  A microservices architecture built with .NET Aspire, leveraging Azure Service Bus for asynchronous communication and Azure Blob Storage for scalable data management, designed to enhance scalability and maintainability in hotel reservation systems.
tags:
  - Dev
  - Azure
  - Microservice
  - CleanArchitecture
  - DDD
  - EDA
  - Backend
---
The project implements a microservices architecture using .NET Aspire to simplify infrastructure creation and enhance observability. It consists of two main services: **Booking** and **Hotel**, designed to manage reservations in a hotel chain.

When a new reservation is created through the **Booking** service API, an event is published to an **Azure Service Bus**. This messaging mechanism allows other services, such as **Hotel**, to receive and process the event asynchronously. In this case, the **Hotel** service includes a background process that listens for these events and stores the relevant information in an **Azure Blob Storage** for further analysis or auditing.

Integrating **Azure Service Bus** in .NET Aspire facilitates connection with instances of this service from .NET applications, enabling efficient communication between microservices. Similarly, integration with **Azure Blob Storage** allows for scalable and secure management and storage of large volumes of unstructured data.

This modular and decoupled approach enhances the system's scalability and maintainability, allowing each service to evolve independently according to business needs.

For more details and to explore the code, visit the [GitHub repository](https://github.com/TempooDev/Booking)
