export default {
    testEnvironment: "jsdom",
    transform: { "\\.js$": "babel-jest" },
};

process.env.TZ = "Europe/Amsterdam";
