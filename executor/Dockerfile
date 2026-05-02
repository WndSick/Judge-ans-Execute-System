FROM golang:1.21-alpine

WORKDIR /app

# Install git and other dependencies if needed
RUN apk add --no-cache git

# Copy go.mod and go.sum first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source
COPY . .

# Build the binary
RUN go build -o executor .

EXPOSE 8080

CMD ["./executor"]
