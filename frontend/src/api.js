import { Platform } from "react-native";

export const API_BASE =
  Platform.OS === "web"
    ? "http://localhost:8080"
    : "http://10.0.0.91:8080"; // IP do teu PC na rede
