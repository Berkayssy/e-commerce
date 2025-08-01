import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './GlobalSearch.css';

const GlobalSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [searchResults, setSearchResults] = useState({
        products: [],
        communities: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    const query = searchParams.get('q') || '';

    const performSearch = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) {
            setSearchResults({ products: [], communities: [] });
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/products/search/global`, {
                params: { q: searchQuery },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            setSearchResults(response.data.results);
        } catch (err) {
            setError('Search failed. Please try again.');
            console.error('Search error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (query) {
            performSearch(query);
        } else {
            setSearchResults({ products: [], communities: [] });
        }
    }, [query, performSearch]);

    const getTotalResults = () => {
        return searchResults.products.length + searchResults.communities.length;
    };

    const renderProductCard = (product) => (
        <div key={product._id} className="search-result-card product-card" onClick={() => navigate(`/product/${product._id}`)}>
            <div className="card-image">
                <img src={product.images?.[0] || '/placeholder-product.jpg'} alt={product.name} />
            </div>
            <div className="card-content">
                <h3 className="card-title">{product.name}</h3>
                <p className="card-category">{product.category} • {product.brand}</p>
                <p className="card-price">${product.price}</p>
                <p className="card-description">{product.description?.substring(0, 100)}...</p>
            </div>
        </div>
    );

    const renderCommunityCard = (community) => (
        <div key={community._id} className="search-result-card community-card" onClick={() => navigate(`/products?communityId=${community._id}`)}>
            <div className="card-image">
                <img src={community.logo?.url || '/placeholder-store.jpg'} alt={community.name} />
            </div>
            <div className="card-content">
                <h3 className="card-title">{community.name}</h3>
                <p className="card-category">Store • {community.transId}</p>
                <p className="card-description">{community.description?.substring(0, 100)}...</p>
            </div>
        </div>
    );



    return (
        <div className="global-search-page">
            <div className="search-header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="header-top">
                            <button 
                                className="back-button"
                                onClick={() => navigate(-1)}
                                title="Go back"
                            >
                                ← Back
                            </button>
                            <h1>Search Results</h1>
                        </div>
                        {query && (
                            <p className="search-query">
                                Showing results for "{query}" ({getTotalResults()} total results)
                            </p>
                        )}
                    </div>
                    {query && (
                        <button 
                            className="clear-button"
                            onClick={() => {
                                setSearchResults({ products: [], communities: [] });
                                setSearchParams({});
                            }}
                        >
                            Clear Results
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Searching...</p>
                </div>
            ) : (
                <div className="search-results-container">
                    {/* Tab Navigation */}
                    <div className="search-tabs">
                        <button 
                            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All ({getTotalResults()})
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
                            onClick={() => setActiveTab('products')}
                        >
                            Products ({searchResults.products.length})
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'communities' ? 'active' : ''}`}
                            onClick={() => setActiveTab('communities')}
                        >
                            Stores ({searchResults.communities.length})
                        </button>

                    </div>

                    {/* Results */}
                    <div className="search-results">
                        {activeTab === 'all' && (
                            <>
                                {searchResults.products.length > 0 && (
                                    <div className="results-section">
                                        <h2>Products ({searchResults.products.length})</h2>
                                        <div className="results-grid">
                                            {searchResults.products.map(renderProductCard)}
                                        </div>
                                    </div>
                                )}
                                
                                {searchResults.communities.length > 0 && (
                                    <div className="results-section">
                                        <h2>Stores ({searchResults.communities.length})</h2>
                                        <div className="results-grid">
                                            {searchResults.communities.map(renderCommunityCard)}
                                        </div>
                                    </div>
                                )}
                                

                            </>
                        )}

                        {activeTab === 'products' && (
                            <div className="results-section">
                                <h2>Products ({searchResults.products.length})</h2>
                                <div className="results-grid">
                                    {searchResults.products.map(renderProductCard)}
                                </div>
                            </div>
                        )}

                        {activeTab === 'communities' && (
                            <div className="results-section">
                                <h2>Stores ({searchResults.communities.length})</h2>
                                <div className="results-grid">
                                    {searchResults.communities.map(renderCommunityCard)}
                                </div>
                            </div>
                        )}



                        {getTotalResults() === 0 && query && (
                            <div className="no-results">
                                <h3>No results found</h3>
                                <p>Try adjusting your search terms or browse our categories</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalSearch; 