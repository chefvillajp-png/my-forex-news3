// api/calendar.js
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const url = "https://www.forexfactory.com/calendar?day=today";

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const events = [];

    $("tr.calendar__row").each((i, el) => {
      const impact = $(el).find(".calendar__cell.calendar__impact").text().trim();
      const currency = $(el).find(".calendar__cell.calendar__currency").text().trim();
      const time = $(el).find(".calendar__cell.calendar__time").text().trim();
      const title = $(el).find(".calendar__cell.calendar__event").text().trim();
      const actual = $(el).find(".calendar__cell.calendar__actual").text().trim() || "—";
      const forecast = $(el).find(".calendar__cell.calendar__forecast").text().trim() || "—";
      const previous = $(el).find(".calendar__cell.calendar__previous").text().trim() || "—";

      // Filtrar: USD + Alto o Medio impacto
      if (
        currency === "USD" &&
        (impact.includes("High") || impact.includes("Medium"))
      ) {
        events.push({
          currency,
          impact,
          time,
          title,
          actual,
          forecast,
          previous,
        });
      }
    });

    res.status(200).json({
      status: "success",
      date: new Date().toISOString().split("T")[0],
      events,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.toString() });
  }
}
