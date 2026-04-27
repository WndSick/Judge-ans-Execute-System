FROM golang:latest

WORKDIR /app

COPY . .

RUN go mod init executor
RUN go get github.com/docker/distribution@v2.8.2+incompatible
RUN go get github.com/docker/docker@v24.0.7
RUN go get github.com/docker/go-connections/nat@v0.4.0
RUN go mod tidy
RUN go mod tidy

RUN go build -o executor .

EXPOSE 8080

CMD ["./executor"]
