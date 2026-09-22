import { ApiTest } from "../api/types";

export const mockRecentTests: ApiTest[] = [
  {
    id: "1",
    request: {
      url: "https://api.example.com/v1/users",
      method: "GET",
      headers: [],
      params: [],
      body: "",
      bodyType: "none",
      authType: "none",
      authData: {}
    },
    response: {
      status: 200,
      statusText: "OK",
      headers: {},
      body: "{}",
      size: 15420,
      contentType: "application/json",
      metrics: { totalTime: 124 },
      insights: []
    },
    timestamp: new Date().toISOString(),
    score: 95
  },
  {
    id: "2",
    request: {
      url: "https://api.example.com/v1/auth/login",
      method: "POST",
      headers: [],
      params: [],
      body: "",
      bodyType: "json",
      authType: "none",
      authData: {}
    },
    response: {
      status: 200,
      statusText: "OK",
      headers: {},
      body: "{}",
      size: 520,
      contentType: "application/json",
      metrics: { totalTime: 450 },
      insights: []
    },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    score: 82
  },
  {
    id: "3",
    request: {
      url: "https://api.example.com/v1/products/slow",
      method: "GET",
      headers: [],
      params: [],
      body: "",
      bodyType: "none",
      authType: "none",
      authData: {}
    },
    response: {
      status: 200,
      statusText: "OK",
      headers: {},
      body: "{}",
      size: 84000,
      contentType: "application/json",
      metrics: { totalTime: 1250 },
      insights: []
    },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    score: 45
  },
  {
    id: "4",
    request: {
      url: "https://api.example.com/v1/payments",
      method: "POST",
      headers: [],
      params: [],
      body: "",
      bodyType: "json",
      authType: "none",
      authData: {}
    },
    response: {
      status: 500,
      statusText: "Internal Server Error",
      headers: {},
      body: "{}",
      size: 120,
      contentType: "application/json",
      metrics: { totalTime: 85 },
      insights: []
    },
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    score: 0
  }
];

export const mockPerformanceData = [
  { time: "00:00", ms: 240 },
  { time: "04:00", ms: 300 },
  { time: "08:00", ms: 210 },
  { time: "12:00", ms: 850 },
  { time: "16:00", ms: 320 },
  { time: "20:00", ms: 260 },
  { time: "24:00", ms: 250 },
];
