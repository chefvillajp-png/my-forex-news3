import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const url = "https://www.forexfactory.com/calendar";

  try {
    // Descargar HTML real con user-agent válido
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      cache: "no-store",
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    // Seleccionar eventos
    const rows = $(".calendar__row.calendar__event");

    let events = [];

    rows.each((i, el) => {
      const currency = $(el).find(".calendar__currency").text().trim();
      const impact = $(el).find(".calendar__impact .impact").attr("title")?.trim();
      const title = $(el).find(".calendar__event-title").text().trim();
      const time = $(el).find(".calendar__time").text().trim();
      const actual = $(el).find(".calendar__actual").text().trim();
      const forecast = $(el).find(".calendar__forecast").text().trim();
      const previous = $(el).find(".calendar__previous").text().trim();

      // Filtrar USD + High/Medium
      if (
        currency === "USD" &&
        (impact === "High Impact Expected" || impact === "Medium Impact Expected")
      ) {
        events.push({
          title,
          currency,
          time,
          impact,
          actual: actual || null,
          forecast: forecast || null,
          previous: previous || null,
        });
      }
    });

    res.status(200).json({
      status: "success",
      date: new Date().toISOString().split("T")[0],
      events,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}
