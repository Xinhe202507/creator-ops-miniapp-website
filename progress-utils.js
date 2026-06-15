(function attachProgressUtils(root) {
  const dailyProgress = {
    "2026-06-15": {
      date: "2026-06-15",
      contacted: 115,
      replied: 42,
      samplesSent: 25,
      videos: 18,
      orders: 650,
      gmv: 42860,
      profit: 11940,
      overdue: 12,
      highRisk: 3,
      team: [
        { name: "Ana", contacted: 34, replied: 15, samples: 8, live: 5, gmv: 15680, overdue: 2 },
        { name: "Bruno", contacted: 28, replied: 9, samples: 5, live: 3, gmv: 7140, overdue: 4 },
        { name: "Carla", contacted: 31, replied: 13, samples: 9, live: 2, gmv: 5490, overdue: 5 },
        { name: "Diego", contacted: 22, replied: 5, samples: 3, live: 1, gmv: 840, overdue: 1 }
      ]
    },
    "2026-06-14": {
      date: "2026-06-14",
      contacted: 96,
      replied: 31,
      samplesSent: 19,
      videos: 14,
      orders: 488,
      gmv: 36240,
      profit: 9360,
      overdue: 8,
      highRisk: 2,
      team: [
        { name: "Ana", contacted: 27, replied: 11, samples: 6, live: 4, gmv: 12100, overdue: 1 },
        { name: "Bruno", contacted: 25, replied: 7, samples: 4, live: 3, gmv: 6280, overdue: 2 },
        { name: "Carla", contacted: 26, replied: 10, samples: 7, live: 2, gmv: 4980, overdue: 4 },
        { name: "Diego", contacted: 18, replied: 3, samples: 2, live: 1, gmv: 680, overdue: 1 }
      ]
    },
    "2026-06-13": {
      date: "2026-06-13",
      contacted: 88,
      replied: 26,
      samplesSent: 16,
      videos: 11,
      orders: 356,
      gmv: 28790,
      profit: 7120,
      overdue: 6,
      highRisk: 4,
      team: [
        { name: "Ana", contacted: 24, replied: 9, samples: 5, live: 3, gmv: 10480, overdue: 1 },
        { name: "Bruno", contacted: 22, replied: 6, samples: 3, live: 2, gmv: 5140, overdue: 2 },
        { name: "Carla", contacted: 23, replied: 8, samples: 6, live: 2, gmv: 4260, overdue: 2 },
        { name: "Diego", contacted: 19, replied: 3, samples: 2, live: 1, gmv: 520, overdue: 1 }
      ]
    }
  };

  function emptyProgress(date) {
    return {
      date,
      contacted: 0,
      replied: 0,
      samplesSent: 0,
      videos: 0,
      orders: 0,
      gmv: 0,
      profit: 0,
      overdue: 0,
      highRisk: 0,
      team: []
    };
  }

  function getDailyProgress(date) {
    return dailyProgress[date] || emptyProgress(date);
  }

  const api = { dailyProgress, getDailyProgress };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.CreatorProgress = api;
})(typeof window !== "undefined" ? window : globalThis);
