import { useEffect, useState } from "react";
import api from "../services/api";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-hot-toast";
import { LogOut, Link as LinkIcon , Copy,} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [urls, setUrls] = useState([]);
  const [togglingUrlIds, setTogglingUrlIds] = useState(() => new Set());

  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [editingUrl, setEditingUrl] = useState(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState("");
  const [editCustomAlias, setEditCustomAlias] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState("");

  const fetchUser = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const fetchUrls = async () => {
    try {
      const response = await api.get("/urls/user-links");
      setUrls(response.data.links);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleCreateUrl = async (e) => {
  e.preventDefault();

  if (!originalUrl) {
    toast.error("Please enter a URL");
    return;
  }

  try {
    setLoading(true);

    const response = await api.post("/urls/shorten", {
      originalUrl,
      customAlias: customAlias || undefined,
      expiresAt: expiresAt || undefined,
    });

    toast.success("Short URL created!");

    console.log(response.data);

    setOriginalUrl("");
    setCustomAlias("");
    setExpiresAt("");

    fetchUrls();

  } catch (error) {
    console.error(error);

    toast.error(
      error.response?.data?.message || "Could not create short URL"
    );

  } finally {
    setLoading(false);
  }
};

const handleCopy = async (shortUrl) => {
  try {
    await navigator.clipboard.writeText(shortUrl);

    toast.success("Short URL copied!");
  } catch (error) {
    console.error(error);

    toast.error("Could not copy URL");
  }
};

const handleToggle = async (id) => {
  const url = urls.find((item) => item._id === id);
  if (!url || togglingUrlIds.has(id)) return;

  setTogglingUrlIds((current) => new Set(current).add(id));
  try {
    const response = await api.patch(`/urls/${id}/toggle`, {
      isActive: !url.isActive,
    });

    setUrls((current) => current.map((item) =>
      item._id === id ? { ...item, isActive: response.data.isActive } : item
    ));

    toast.success(response.data.message);
  } catch (error) {
    console.error(error);

    toast.error(
      error.response?.data?.message || "Could not update URL status"
    );
  } finally {
    setTogglingUrlIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }
};


    const handleShortenUrl = async (e) => {
        e.preventDefault();

    if (!originalUrl) {
      toast.error("Please enter a URL to shorten.");
      return;
    }
    try {
    setLoading(true);

    const response = await api.post("/urls/shorten", {
      originalUrl,
      customAlias: customAlias || undefined,
      expiresAt: expiresAt || undefined,
    });

    toast.success("Short URL created!");

    console.log(response.data);

    setOriginalUrl("");
    setCustomAlias("");
    setExpiresAt("");

    fetchUrls();

  } catch (error) {
    console.error(error);

    toast.error(
      error.response?.data?.message || "Could not create short URL"
    );

  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  const checkAuth = async () => {
    try {
      await fetchUser();
      await fetchUrls();
      setAuthLoading(false);
    } catch (error) {
      window.location.href = "/";
    }
  };

  checkAuth();
}, []);


  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");

      toast.success("Logged out successfully!");

      window.location.href = "/";
    } catch (error) {
      console.error(error);
      toast.error("Logout failed");
    }
  };

  const handleDelete = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this URL?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await api.delete(`/urls/${id}`);

    toast.success("URL deleted successfully!");

    fetchUrls();
  } catch (error) {
    console.error(error);

    toast.error(
      error.response?.data?.message || "Could not delete URL"
    );
  }
};

const handleEditClick = (url) => {
  setEditingUrl(url);
  setEditOriginalUrl(url.originalUrl);
  setEditCustomAlias(url.customAlias || "");
  setEditExpiresAt(
    url.expiresAt
      ? new Date(url.expiresAt).toISOString().slice(0, 16)
      : ""
  );
};

const handleUpdateUrl = async (e) => {
  e.preventDefault();

  try {
    await api.patch(`/urls/${editingUrl._id}`, {
      originalUrl: editOriginalUrl,
      customAlias: editCustomAlias,
      expiresAt: editExpiresAt || null,
    });

    toast.success("URL updated successfully!");

    setEditingUrl(null);
    setEditOriginalUrl("");
    setEditCustomAlias("");
    setEditExpiresAt("");

    fetchUrls();
  } catch (error) {
    console.error(error);
    toast.error(
      error.response?.data?.message || "Could not update URL"
    );
  }
};

const prepareClickData = (history = []) => {
  const timeCounts = {};

  history.forEach((click) => {
    const time = new Date(click.clickedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    timeCounts[time] = (timeCounts[time] || 0) + 1;
  });

  return Object.entries(timeCounts).map(([time, clicks]) => ({
    time,
    clicks,
  }));
};

const prepareBrowserData = (history = []) => {
  const browserCounts = {};

  history.forEach((click) => {
    const browser = click.browser || "Unknown";

    browserCounts[browser] =
      (browserCounts[browser] || 0) + 1;
  });

  return Object.entries(browserCounts).map(
    ([browser, count]) => ({
      browser,
      clicks: count,
    })
  );
};

const prepareOsData = (history = []) => {
  const osCounts = {};

  history.forEach((click) => {
    const os = click.os || "Unknown";

    osCounts[os] = (osCounts[os] || 0) + 1;
  });

  return Object.entries(osCounts).map(([os, count]) => ({
    os,
    clicks: count,
  }));
};

const prepareDeviceData = (history = []) => {
  const deviceCounts = {};

  history.forEach((click) => {
    const device = click.device || "Unknown";

    deviceCounts[device] =
      (deviceCounts[device] || 0) + 1;
  });

  return Object.entries(deviceCounts).map(
    ([device, count]) => ({
      device,
      clicks: count,
    })
  );
};

const handleAnalytics = async (id) => {
  try {
    const response = await api.get(`/urls/${id}/analytics`);
    setAnalytics(response.data.analytics);
  } catch (error) {
    console.error(error);
    toast.error(
      error.response?.data?.message || "Could not fetch analytics"
    );
  }
};

if (authLoading) {
  return <div>Checking authentication...</div>;
}

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LinkIcon className="text-blue-600" />
          <h1 className="text-xl font-bold">
            URL Shortener
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-600">
              Hi, {user.name} 👋
            </span>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        <h2 className="text-3xl font-bold mb-2">
          Your Dashboard
        </h2>

        <p className="text-gray-500 mb-8">
          Create and manage your shortened URLs.
        </p>

       {/* Create URL section */}
<div className="bg-white rounded-2xl shadow-sm p-6 mb-8">

  <h3 className="text-xl font-semibold mb-5">
    Create Short URL
  </h3>

  <form onSubmit={handleCreateUrl} className="space-y-4">

    <input
      type="text"
      value={originalUrl}
      onChange={(e) => setOriginalUrl(e.target.value)}
      placeholder="Paste your long URL"
      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <input
        type="text"
        value={customAlias}
        onChange={(e) => setCustomAlias(e.target.value)}
        placeholder="Custom alias (optional)"
        className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="datetime-local"
        value={expiresAt}
        onChange={(e) => setExpiresAt(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />

    </div>

    <button
      type="submit"
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
    >
      {loading ? "Creating..." : "Shorten URL"}
    </button>

  </form>

</div>


        {/* Links section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">

          <h3 className="text-xl font-semibold mb-5">
            Your Links
          </h3>

          {urls.length === 0 ? (
            <p className="text-gray-500">
              You haven't created any shortened URLs yet.
            </p>
          ) : (
            <div className="space-y-4">


          {editingUrl && (
  <form
    onSubmit={handleUpdateUrl}
    className="mb-6 p-5 bg-gray-50 rounded-xl border space-y-4"
  >
    <h3 className="text-lg font-semibold">
      Edit URL
    </h3>

    <input
      type="url"
      value={editOriginalUrl}
      onChange={(e) => setEditOriginalUrl(e.target.value)}
      placeholder="Original URL"
      className="w-full px-4 py-2 border rounded-lg"
      required
    />

    <input
      type="text"
      value={editCustomAlias}
      onChange={(e) => setEditCustomAlias(e.target.value)}
      placeholder="Custom Alias"
      className="w-full px-4 py-2 border rounded-lg"
    />

    <input
      type="datetime-local"
      value={editExpiresAt}
      onChange={(e) => setEditExpiresAt(e.target.value)}
      className="w-full px-4 py-2 border rounded-lg"
    />

    <div className="flex gap-3">
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Save Changes
      </button>

      <button
        type="button"
        onClick={() => setEditingUrl(null)}
        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
      >
        Cancel
      </button>
    </div>
  </form>
)}
              {urls.map((url) => (
                <div
                  key={url._id}
                  className="border border-gray-200 rounded-xl p-4"
                >
                  <p className="font-medium break-all">
                    {url.originalUrl}
                  </p>

                 <a
                    href={`http://localhost:5000/api/urls/${
                     url.customAlias || url.shortId
                      }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                  >
                       http://localhost:5000/api/urls/{url.customAlias || url.shortId}
                       </a>

                  <div className="flex items-center gap-4 mt-4">

  <span className="text-sm text-gray-500">
    {url.clicks} clicks
  </span>

  <span className="text-sm text-gray-500">
    {url.isActive ? "Active" : "Inactive"}
  </span>

  <button
    onClick={() =>
      handleCopy(
        `http://localhost:5000/api/urls/${
          url.customAlias || url.shortId
        }`
      )
    }
    className="ml-auto flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium"
  >
    <Copy size={16} />
    Copy
  </button>

<button
  onClick={() => handleToggle(url._id)}
  disabled={togglingUrlIds.has(url._id)}
  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium"
>
  {togglingUrlIds.has(url._id) ? "Updating…" : url.isActive ? "Deactivate" : "Activate"}
</button>

<button
  onClick={() => handleAnalytics(url._id)}
  className="px-3 py-1 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
>
  Analytics
</button>


<button
  onClick={() =>
    setQrUrl(
      `http://localhost:5000/api/urls/${
        url.customAlias || url.shortId
      }`
    )
  }
  className="px-3 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600"
>
  QR
</button>

<button
  onClick={() => handleEditClick(url)}
  className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
>
  Edit
</button>

<button
  onClick={() => handleDelete(url._id)}
  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium"
>
  Delete
</button>

</div>

{analytics && analytics.shortId === url.shortId && (
  <div className="mt-6 p-6 bg-white rounded-xl shadow border">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-2xl font-bold text-gray-800">
        📊 URL Analytics
      </h3>

      <button
        onClick={() => setAnalytics(null)}
        className="text-gray-500 hover:text-gray-800 text-xl"
      >
        ✕
      </button>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
     <div className="p-4 bg-white rounded-xl border shadow-sm">
        <p className="text-sm text-gray-500">Total Clicks</p>
        <p className="text-2xl font-bold">
          {analytics.clicks}
        </p>
      </div>

      <div className="p-4 bg-white rounded-xl border shadow-sm">
        <p className="text-sm text-gray-500">Browser</p>
        <p className="text-lg font-semibold">
          {analytics.visitorStats?.browser || "Unknown"}
        </p>
      </div>

      <div className="p-4 bg-white rounded-xl border shadow-sm">
        <p className="text-sm text-gray-500">Operating System</p>
        <p className="text-lg font-semibold">
          {analytics.visitorStats?.os || "Unknown"}
        </p>
      </div>

     <div className="p-4 bg-white rounded-xl border shadow-sm">
        <p className="text-sm text-gray-500">Device</p>
        <p className="text-lg font-semibold">
          {analytics.visitorStats?.device || "Unknown"}
        </p>
      </div>
    </div>

    <div className="mt-5 space-y-2 text-sm">
      <p>
        <strong>Original URL:</strong>{" "}
        {analytics.originalUrl}
      </p>

      <p>
        <strong>Short ID:</strong>{" "}
        {analytics.shortId}
      </p>

      <p>
        <strong>Last Visited:</strong>{" "}
        {analytics.lastVisited
          ? new Date(analytics.lastVisited).toLocaleString()
          : "Never"}
      </p>

      <p>
        <strong>Created At:</strong>{" "}
        {new Date(analytics.createdAt).toLocaleString()}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        {analytics.isActive ? "Active" : "Inactive"}
      </p>

      <div className="mt-8">
  <h4 className="text-lg font-semibold mb-4">
    📈 Clicks Over Time
  </h4>

  {analytics?.clickHistory?.length > 0 ? (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={prepareClickData(analytics.clickHistory)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar
            dataKey="clicks"
            fill="#2563eb"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <p className="text-gray-500">
      No click data available yet.
    </p>
  )}
</div>

<div className="grid grid-cols-3 gap-6">

<div className="p-4 bg-white rounded-xl border shadow-sm">
  <h4 className="text-lg font-semibold mb-4">
    🌐 Browsers
  </h4>

  {analytics?.clickHistory?.length > 0 ? (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={prepareBrowserData(analytics.clickHistory)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="browser" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar
            dataKey="clicks"
            fill="#7c3aed"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <p className="text-gray-500">
      No browser data available yet.
    </p>
  )}
 </div>

   <div className="bg-gray-50 rounded-xl p-4 border">
  <h4 className="text-lg font-semibold mb-4">
    💻 Operating Systems
  </h4>

  {analytics?.clickHistory?.length > 0 ? (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={prepareOsData(analytics.clickHistory)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="os" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar
            dataKey="clicks"
            fill="#059669"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <p className="text-gray-500">
      No operating system data available yet.
    </p>
  )}
</div>

<div className="bg-gray-50 rounded-xl p-4 border">
  <h4 className="text-lg font-semibold mb-4">
    📱 Devices
  </h4>

  {analytics?.clickHistory?.length > 0 ? (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={prepareDeviceData(analytics.clickHistory)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="device" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar
            dataKey="clicks"
            fill="#ea580c"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <p className="text-gray-500">
      No device data available yet.
    </p>
  )}
</div>
</div>
    </div>
  </div>
)}

</div>
))}

</div>
)}

{qrUrl && (
  <div className="mt-6 p-6 bg-white rounded-xl shadow border">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-xl font-semibold">
        📱 QR Code
      </h3>

      <button
        onClick={() => setQrUrl(null)}
        className="text-gray-500 hover:text-gray-800"
      >
        ✕
      </button>
    </div>

    <div className="flex flex-col items-center gap-4">
      <QRCodeCanvas
        value={qrUrl}
        size={220}
      />

      <p className="text-sm text-gray-500 break-all text-center">
        {qrUrl}
      </p>
    </div>
  </div>
)}

        </div>


      </main>

    </div>
  );
}

export default Dashboard;
