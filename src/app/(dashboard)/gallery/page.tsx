"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { BarChart3, Eye, Heart, TrendingUp } from "lucide-react";

const categories = ["All", "Dashboards", "Charts", "Maps", "Infographics", "Models"];

const mockShowcases = [
  {
    id: "1",
    title: "NFL Draft Prospect Analysis Dashboard",
    author: "Ben Schubbe",
    sport: "Football",
    type: "Dashboards",
    views: 342,
    likes: 47,
    thumbnail: null,
  },
  {
    id: "2",
    title: "NBA Shot Chart Heat Map",
    author: "Sarah Chen",
    sport: "Basketball",
    type: "Charts",
    views: 289,
    likes: 38,
  },
  {
    id: "3",
    title: "Soccer Expected Goals Model",
    author: "Marco Rivera",
    sport: "Soccer",
    type: "Models",
    views: 215,
    likes: 31,
  },
  {
    id: "4",
    title: "MLB Pitch Movement Visualization",
    author: "Emily Park",
    sport: "Baseball",
    type: "Charts",
    views: 198,
    likes: 26,
  },
  {
    id: "5",
    title: "NCAA Basketball Tournament Bracket Predictor",
    author: "James Wilson",
    sport: "Basketball",
    type: "Models",
    views: 456,
    likes: 62,
  },
  {
    id: "6",
    title: "NHL Player Performance Radar Charts",
    author: "Alex Johnson",
    sport: "Hockey",
    type: "Charts",
    views: 167,
    likes: 22,
  },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? mockShowcases
      : mockShowcases.filter((s) => s.type === activeCategory);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-bryant-black">Gallery</h1>
        <p className="mt-1 text-sm text-bryant-gray-500">
          Browse visualizations and analytics showcases from the community.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Showcases", value: "48", icon: BarChart3 },
          { label: "Total Views", value: "12.4k", icon: Eye },
          { label: "This Month", value: "+8", icon: TrendingUp },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bryant-gold/10">
                <stat.icon className="h-5 w-5 text-bryant-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-bryant-black">{stat.value}</p>
                <p className="text-xs text-bryant-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category tabs */}
      <Tabs activeTab={activeCategory} onTabChange={setActiveCategory}>
        <TabList>
          {categories.map((cat) => (
            <Tab key={cat} value={cat}>
              {cat}
            </Tab>
          ))}
        </TabList>

        <TabPanel value={activeCategory}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <Card key={item.id} className="overflow-hidden transition-shadow hover:shadow-md">
                {/* Thumbnail placeholder */}
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-bryant-gray-100 to-bryant-gray-200">
                  <BarChart3 className="h-12 w-12 text-bryant-gray-300" />
                </div>
                <CardContent className="py-4">
                  <h3 className="font-semibold text-bryant-black line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-bryant-gray-500">{item.author}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="sport">{item.sport}</Badge>
                    <div className="flex items-center gap-3 text-xs text-bryant-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {item.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {item.likes}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
