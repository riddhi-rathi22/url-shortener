const app = require("./src/app");
const connectDB = require("./src/config/db");
const PORT = 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});