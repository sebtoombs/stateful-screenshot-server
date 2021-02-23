const yup = require("yup");
const puppeteer = require("puppeteer");
const fs = require("fs").promises;

const sleep = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

function parseAndValidateOpts(opts) {
  let schema = yup.object().shape({
    viewport: yup
      .object()
      .shape({
        width: yup.number().positive().integer().required(),
        height: yup.number().positive().integer().required(),
      })
      .default(null),
    type: yup.mixed().oneOf(["jpeg", "png"]).default("jpeg"),
    clip: yup.object().shape({
      width: yup.number().positive().integer().required(),
      height: yup.number().positive().integer().required(),
      x: yup.number().min(0).integer().required(),
      y: yup.number().min(0).integer().required(),
    }),
  });

  return schema.validate(opts);
}

module.exports = async (events, _opts) => {
  const opts = await parseAndValidateOpts(_opts);

  const { viewport } = opts;

  const puppeteerOpts = {
    headless: true,
    executablePath: "/usr/bin/chromium",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      // This will write shared memory files into /tmp instead of /dev/shm,
      // because Docker’s default for /dev/shm is 64MB
      // "--disable-dev-shm-usage",
    ], //"--disable-gpu"
  };

  if (viewport) {
    puppeteerOpts.args.push(
      `--window-size=${viewport.width},${viewport.height}`
    );
    puppeteerOpts.defaultViewport = null;
  }

  const browser = await puppeteer.launch(puppeteerOpts);
  const page = await browser.newPage();

  // const content = await fs.readFile("page.html", "utf-8");
  const scriptContent = await fs.readFile("./dist/main.js", "utf-8");
  const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Stateful Screenshot</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"><script>${scriptContent}</script></head>
  <body>
  </body>
</html>`;

  await page.setContent(htmlContent, {
    waitUntil: "domcontentloaded",
  });

  await sleep(100);

  await page.evaluate((events) => {
    // new rrwebPlayer({
    //   target: document.body, // customizable root element
    //   props: {
    //     events,
    //   },
    // });

    // setTimeout(() => {
    //   document.documentElement.innerHTML = document.querySelector(
    //     "iframe"
    //   ).contentDocument.documentElement.innerHTML;
    // }, 1);

    const replayer = new Replayer(events);

    const goto = (timeOffset) => {
      replayer.play(timeOffset);
      replayer.pause();
    };

    const startTime = events[0].timestamp;
    const endTime = events[events.length - 1].timestamp;

    setTimeout(() => {
      waitForReplayer(() => {
        goto(endTime - startTime);

        setTimeout(() => {
          document.documentElement.innerHTML = document.querySelector(
            "iframe"
          ).contentDocument.documentElement.innerHTML;
        }, 100);
      });
    }, 100);

    function waitForReplayer(cb) {
      const frame = document.querySelector("iframe");
      if (!frame) {
        setTimeout(() => {
          waitForReplayer(cb);
        }, 100);
      }
      return cb();
    }
  }, events);

  await sleep(1000);

  //fullpage
  const result = await page.screenshot({ ...opts });

  await browser.close();

  return result;
};
