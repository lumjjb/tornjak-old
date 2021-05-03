package main

import (
	"log"

	managerapi "github.com/lumjjb/tornjak/manager/api"
)

func main() {
	var (
		dbString   = "./serverslocaldb"
		listenAddr = ":50000"
	)
	s, err := managerapi.NewManagerServer(listenAddr, dbString)
	if err != nil {
		log.Fatalf("err: %v", err)
	}
	s.HandleRequests()
}
