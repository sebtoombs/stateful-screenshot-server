require("dotenv").config();

function parseConfig() {
  const config = Object.values(
    Object.keys(process.env).reduce((obj, k) => {
      const m = k.match(/^CONFIG_(\d+)_(.*?)$/);
      if (!m) return obj;
      const groupKey = m[1];
      const key = m[2];
      if (typeof obj[groupKey] === "undefined") {
        obj[groupKey] = {};
      }
      obj[groupKey][key] = process.env[k];

      return obj;
    }, {})
  );

  return {
    config,
    getByKey(key) {
      return config.find((c) => c.API_MASTER_KEY === key);
    },
  };
}
const allConfig = parseConfig();

const bodyParser = require("body-parser");
const takeScreenshot = require("./takeScreenshot");
const uploadImage = require("./uploadImage");
const { set } = require("lodash");
const yup = require("yup");
const service = require("restana")({
  // errorHandler(err, req, res) {
  //   console.log(`Something was wrong: ${err.message || err}`);
  //   res.send(err);
  // },
});

service.use(bodyParser.json({ limit: "50mb" }));

service.use((req, res, next) => {
  let config;
  if (req.headers["x-api-key"]) {
    config = allConfig.getByKey(req.headers["x-api-key"]);
    req.config = config;
  }

  if (!req.config) {
    return res.send(401);
  }
  return next();
});

function parseQueryOptions(query) {
  const opts = {};
  Object.keys(query).forEach((key) => {
    set(opts, key, query[key]);
  });
  return opts;
}

/**
 * Query:
 *
 * https://pptr.dev/#?product=Puppeteer&version=v7.1.0&show=api-pagescreenshotoptions
 *
 * filename : optional file name for the image
 * viewport {
 *  width
 *  height
 * }
 * clip {
 *  x
 *  y
 *  width
 *  height
 * }
 * type: jpeg/ png
 */

function parseAndValidateOpts(opts) {
  let schema = yup.object().shape({
    output: yup.string().default("return"),
    filename: yup.string(),
    type: yup.mixed().oneOf(["jpeg", "png"]).default("jpeg"),
  });

  return schema.validate(opts);
}

service.post("/screenshot", async (req, res) => {
  const opts = await parseAndValidateOpts(parseQueryOptions(req.query));

  const events = req.body;
  const { type, filename } = opts;

  try {
    if (!events || !Array.isArray(events)) {
      const newErr = new Error("Events array missing");
      newErr.name = "Validation Error";
      newErr.path = "body";
      throw newErr;
    }
    const screenshot = await takeScreenshot(events, opts);

    if (opts.output === "upload") {
      const uploadResult = await uploadImage(
        req.config,
        screenshot,
        type,
        filename
      );
      console.log("Saved screenshot", uploadResult.key);
      res.send(uploadResult);
    } else {
      res.send(screenshot, 200, {
        "content-type": `image/${type}`,
      });
    }
  } catch (e) {
    res.send(
      {
        name: e.name,
        path: e.path,
        type: e.type,
        message: e.message,
        errors: e.errors,
      },
      400
    );
    return;
  }

  // res.send("done");
});

const port = parseInt(process.env.PORT || 8080);

service.start(port).then(() => {
  console.log("Listening on:", port);
});

// Handle ^C
process.on("SIGINT", shutdown);

// Do graceful shutdown
function shutdown() {
  console.log("Shutting down server...");
  service.close().then(() => {
    console.log("Server shut down.");
    process.exit(0); // or 1 for error
  });
}
