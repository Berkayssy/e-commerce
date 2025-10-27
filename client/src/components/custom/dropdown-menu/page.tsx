import React, { useState } from "react";
import {
  ChevronDown,
  Store,
  ShoppingCart,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  DollarSign,
  Headphones,
} from "lucide-react";

interface MenuItem {
  title: string;
  desc: string;
  highlight?: boolean;
}

interface MenuSection {
  icon: React.ReactNode;
  title: string;
  color: string;
  items: MenuItem[];
}

interface MenuData {
  sections: MenuSection[];
}

export default function MegaDropdownMenu() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const menuData: Record<string, MenuData> = {
    solutions: {
      sections: [
        {
          icon: <Store className="w-6 h-6" />,
          title: "Get Started",
          color: "text-green-500",
          items: [
            { title: "Set up your business", desc: "Build your brand" },
            { title: "Create your website", desc: "Online store builder" },
            { title: "Customize your store", desc: "Store themes" },
          ],
        },
        {
          icon: <ShoppingCart className="w-6 h-6 text-secondary-900" />,
          title: "Sell",
          color: "text-blue-500",
          items: [
            { title: "Sell your products", desc: "Online or in-person sales" },
            { title: "Sell online", desc: "Grow your business online" },
            { title: "Sell globally", desc: "International sales" },
          ],
        },
        {
          icon: <TrendingUp className="w-6 h-6 text-danger-400" />,
          title: "Market",
          color: "text-purple-500",
          items: [
            { title: "Market your business", desc: "Reach & retain customers" },
            {
              title: "Market through social",
              desc: "Social media integrations",
            },
            { title: "Know your audience", desc: "Customer analytics" },
          ],
        },
        {
          icon: <Users className="w-6 h-6 text-accent-300" />,
          title: "Manage",
          color: "text-orange-500",
          items: [
            { title: "Manage your business", desc: "Track sales & orders" },
            { title: "Measure performance", desc: "Analytics & reporting" },
            { title: "Manage inventory", desc: "Inventory control" },
          ],
        },
      ],
    },
    pricing: {
      sections: [
        {
          icon: <DollarSign className="w-6 h-6" />,
          title: "Plans",
          color: "text-green-500",
          items: [
            { title: "Basic", desc: "$29/month", highlight: true },
            { title: "Standard", desc: "$79/month", highlight: true },
            { title: "Advanced", desc: "$299/month", highlight: true },
          ],
        },
        {
          icon: <Zap className="w-6 h-6" />,
          title: "Features",
          color: "text-yellow-500",
          items: [
            { title: "Payment processing", desc: "Secure infrastructure" },
            { title: "POS system", desc: "Physical store integration" },
            { title: "Analytics", desc: "Detailed reports" },
          ],
        },
        {
          icon: <BarChart3 className="w-6 h-6" />,
          title: "Compare",
          color: "text-blue-500",
          items: [
            { title: "Compare all plans", desc: "Which one suits you?" },
            { title: "Free trial", desc: "14 days free" },
          ],
        },
      ],
    },
    support: {
      sections: [
        {
          icon: <Headphones className="w-6 h-6" />,
          title: "Help",
          color: "text-red-500",
          items: [
            { title: "24/7 Support", desc: "Always here for you" },
            { title: "Live Chat", desc: "Get instant help" },
            { title: "Phone Support", desc: "Reach us anytime" },
          ],
        },
        {
          icon: <Users className="w-6 h-6" />,
          title: "Community",
          color: "text-pink-500",
          items: [
            { title: "Forum", desc: "Connect with others" },
            { title: "Expert Network", desc: "Professional help" },
            { title: "Events", desc: "Live events" },
          ],
        },
      ],
    },
  };

  return (
    <div className="bg-white text-primary-900 relative top-4 mx-20">
      {/* Navbar */}
      <nav className=" justify-between">
        <div className="flex items-center justify-between ">
          <div className="flex items-center">
            {/* Menu Items */}
            <div className="hidden md:flex justify-center items-center font-thin pt-2">
              <button
                onClick={() => setActiveDropdown("solutions")}
                className={`px-4 py-2 transition-colors flex items-center gap-2 ${
                  activeDropdown === "solutions"
                    ? "border-s-gray-50"
                    : "hover:underline"
                }`}
              >
                <span>Solutions</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    activeDropdown === "solutions" ? "rotate-180" : ""
                  }`}
                />
              </button>

              <button
                onClick={() => setActiveDropdown("pricing")}
                className={`px-4 py-2 transition-colors flex items-center gap-2 ${
                  activeDropdown === "pricing"
                    ? "border-s-gray-50"
                    : "hover:underline"
                }`}
              >
                <span>Pricing</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    activeDropdown === "pricing" ? "rotate-180" : ""
                  }`}
                />
              </button>

              <button
                onClick={() => setActiveDropdown("support")}
                className={`px-4 py-2 transition-colors flex items-center gap-2 ${
                  activeDropdown === "support"
                    ? "border-s-gray-50"
                    : "hover:underline"
                }`}
              >
                <span>Support</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    activeDropdown === "support" ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Content */}
        {activeDropdown && (
          <div
            className="bg-white text-primary-900 "
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className="py-12 border-t">
              <div className="grid grid-cols-4 lg:grid-cols-4 gap-10">
                {menuData[activeDropdown]?.sections.map(
                  (section: MenuSection, idx: number) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex items-center gap-4 mb-4 pl-2">
                        <div className={section.color}>{section.icon}</div>
                        <h3 className="font-semibold text-lg">
                          {section.title}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {section.items.map(
                          (item: MenuItem, itemIdx: number) => (
                            <a
                              key={itemIdx}
                              href="#"
                              className={`block p-3 rounded-lg hover:border-s-danger-400 border-transparent transition group ${
                                item.highlight ? "border border-gray-700" : ""
                              }`}
                            >
                              <div className="font-medium group-hover:text-danger transition">
                                {item.title}
                              </div>
                              <div className="text-sm text-gray-400 mt-1">
                                {item.desc}
                              </div>
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Bottom CTA */}
              <div className="mt-12 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold mb-2 pl-2">
                      {activeDropdown === "solutions" &&
                        "Ready to get started today?"}
                      {activeDropdown === "pricing" && "Choose the right plan"}
                      {activeDropdown === "support" && "Need help?"}
                    </h4>
                    <p className="text-gray-400 pl-2">
                      {activeDropdown === "solutions" &&
                        "Try free for 14 days, no credit card required"}
                      {activeDropdown === "pricing" &&
                        "Compare all plans and features"}
                      {activeDropdown === "support" &&
                        "24/7 support team ready to help"}
                    </p>
                  </div>
                  <button className="px-8 py-3 text-justify bg-secondary-900 text-white shadow-soft hover:bg-primary-900 hover:text-secondary-400 rounded-full font-semibold transition whitespace-nowrap">
                    {activeDropdown === "solutions" && "Start Free Trial"}
                    {activeDropdown === "pricing" && "View Plans"}
                    {activeDropdown === "support" && "Get Support"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
