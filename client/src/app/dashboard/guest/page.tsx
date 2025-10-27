"use client";

import React, { useState } from "react";
import {
  Heart,
  ShoppingCart,
  Bell,
  Menu,
  Search,
  MapPin,
  CreditCard,
  Settings,
  Flag,
  MessageSquare,
  MoreVertical,
  Star,
} from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Popular Stores");
  const [activeSection, setActiveSection] = useState("Stores");

  const tabs = [
    "Popular Stores",
    "New Stores",
    "Old Stores",
    "Discount Stores",
    "Other Stores",
  ];

  const stores = [
    {
      id: 1,
      name: "Tom's Beasts",
      initial: "T",
      badge: "Enterprice",
      verified: true,
      storeName: "Tom's Beasts Store",
      subtitle: "Subtitle",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
      rating: 5,
      members: 3,
      bgColor: "bg-purple-600",
    },
    {
      id: 2,
      name: "Vintage Mercedes",
      initial: "V",
      badge: "Pro",
      verified: true,
      storeName: "Vintage Mercedes Store",
      subtitle: "Subtitle",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
      rating: 5,
      members: 3,
      bgColor: "bg-slate-600",
    },
    {
      id: 3,
      name: "Berkay's Gallery",
      initial: "B",
      badge: "Starter",
      verified: false,
      storeName: "Yacht Club Store",
      subtitle: "Subtitle",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
      rating: 5,
      members: 3,
      bgColor: "bg-slate-700",
    },
  ];

  const newListings = [
    {
      id: 1,
      name: "Automomous",
      initial: "A",
      badge: "Enterprice",
      verified: false,
    },
    {
      id: 2,
      name: "Motors Gallery",
      initial: "M",
      badge: null,
      verified: true,
    },
    {
      id: 3,
      name: "Sparta Gallery",
      initial: "S",
      badge: "Pro",
      verified: true,
    },
    {
      id: 4,
      name: "Air Gallery",
      initial: "A",
      badge: "Enterprice",
      verified: false,
    },
    {
      id: 5,
      name: "Yacht Club",
      initial: "Y",
      badge: "Enterprice",
      verified: false,
    },
    { id: 6, name: "Just Super", initial: "J", badge: "Pro", verified: true },
  ];

  const favoriteStores = [
    { name: "Tom's Gallery" },
    { name: "Creative BMWs" },
    { name: "Mullin Automotive Museum" },
  ];

  const getBadgeColor = (badge?: string | null): string => {
    if (badge === "Enterprice") return "text-red-600";
    if (badge === "Pro") return "text-blue-600";
    return "text-gray-600";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        {/* User Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <button className="text-gray-600">
              <Menu size={20} />
            </button>
            <span className="text-xs text-gray-500">Tom</span>
          </div>
          <h2 className="text-xl font-semibold">Hardy</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <button
            onClick={() => setActiveSection("Stores")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-2 ${
              activeSection === "Stores" ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={20} />
              <span className="font-medium">Stores</span>
            </div>
            <span className="text-sm text-gray-500">24</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 mb-2">
            <CreditCard size={20} />
            <span className="font-medium">Payment</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 mb-2">
            <Heart size={20} />
            <span className="font-medium">Favorites</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 mb-6">
            <MapPin size={20} />
            <span className="font-medium">Address</span>
          </button>

          {/* Favorites Stores Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3 px-4">
              Favorites Stores
            </h3>
            {favoriteStores.map((store, idx) => (
              <button
                key={idx}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 mb-1"
              >
                <Heart size={18} />
                <span className="text-sm">{store.name}</span>
              </button>
            ))}
          </div>

          {/* More Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3 px-4">
              More
            </h3>
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 mb-1">
              <Settings size={18} />
              <span className="text-sm">Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 mb-1">
              <Flag size={18} />
              <span className="text-sm">Report Store</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100">
              <MessageSquare size={18} />
              <span className="text-sm">Feedback</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <ShoppingCart size={18} className="text-white" />
              </div>
              <span className="text-lg font-semibold">Galeria</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={20}
                />
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Heart size={22} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ShoppingCart size={22} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Bell size={22} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical size={22} />
              </button>
              <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
                <span>👤</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Tabs */}
            <div className="flex gap-6 mb-6 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-2 font-medium transition-colors ${
                    activeTab === tab
                      ? "text-black border-b-2 border-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Store Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Card Header */}
                  <div className="bg-gray-100 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${store.bgColor} rounded-full flex items-center justify-center text-white font-semibold`}
                      >
                        {store.initial}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{store.name}</span>
                          {store.verified && (
                            <span className="text-blue-500">✓</span>
                          )}
                        </div>
                        <span
                          className={`text-xs ${getBadgeColor(store.badge)}`}
                        >
                          {store.badge}
                        </span>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  {/* Store Image Placeholder */}
                  <div
                    className={`h-40 ${
                      store.id === 1 ? "bg-purple-100 border-4" : "bg-gray-100"
                    } flex items-center justify-center`}
                  >
                    <div className="text-center text-gray-400">
                      <div className="text-6xl mb-2">🏪</div>
                      <div className="flex gap-2 justify-center">
                        <div className="w-8 h-8 bg-gray-300 rounded"></div>
                        <div className="w-8 h-8 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="bg-slate-800 text-white p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{store.storeName}</h3>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill="orange"
                            className="text-orange-400"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">
                      {store.subtitle}
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      {store.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-yellow-500 border-2 border-slate-800"></div>
                          <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-slate-800"></div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-slate-800 flex items-center justify-center text-xs">
                          ✓
                        </div>
                        <span className="text-xs text-gray-400">+1</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-700 rounded-lg">
                          <Heart size={18} />
                        </button>
                        <button className="px-4 py-2 bg-gray-300 hover:bg-gray-200 text-black rounded-lg text-sm font-medium">
                          Go to Store
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* New Listings Section */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <span className="text-lg">+</span>
                </div>
                <h2 className="text-lg font-semibold">New Listings</h2>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* New Listings Grid */}
            <div className="grid grid-cols-6 gap-4">
              {newListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="bg-gray-100 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {listing.initial}
                      </div>
                      {listing.verified && (
                        <span className="text-blue-500 text-xs">✓</span>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm mb-1">{listing.name}</h4>
                    {listing.badge && (
                      <span
                        className={`text-xs ${getBadgeColor(listing.badge)}`}
                      >
                        {listing.badge}
                      </span>
                    )}
                  </div>
                  <div className="h-32 bg-gray-100"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
