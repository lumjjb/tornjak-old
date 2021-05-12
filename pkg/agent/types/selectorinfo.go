package types

// SelectorInfo contains the information about agents selectors
type SelectorInfo struct {
	Id       string `json:"id"`
	Spiffeid string `json:"spiffeid"`
	Plugin   string `json:"plugin"`
}

// SelectorInfoList contains the information about selectors plugin
type SelectorInfoList struct {
	Plugin []SelectorInfo `json:"plugin"`
}
