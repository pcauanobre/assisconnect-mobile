// server/src/server.js
import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 AssisConnect server running at http://localhost:${PORT}`);
});
