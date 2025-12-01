import * as cheerio from "cheerio"; 
export const config = {
  runtime: "edge",
};

export default async function handler(req) {

  const url = "https://www.forexfactory.com/calendar?day=today";

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const events = [];

    $("tr.calendar__row").each((i, el) => {

      const currency = $(el).find(".calendar__currency").text().trim();
      const impact = $(el).find(".impact-icon").attr("title") || "";
      const event = $(el).find(".calendar__event-title").text().trim();
      const time = $(el).find(".calendar__time").text().trim();

      const forecast = $(el).find(".calendar__forecast").text().trim();
      const previous = $(el).find(".calendar__previous").text().trim();
      const actual = $(el).find(".calendar__actual").text().trim();

      // FILTROS
      if (currency === "USD" && (impact.includes("High") || impact.includes("Medium"))) {
        events.push({
          currency,
          impact,
          event,
          time,
          forecast: forecast || null,
          previous: previous || null,
          actual: actual || null,
        });
      }

    });

    return new Response(
      JSON.stringify({
        status: "success",
        date: new Date().toISOString().slice(0, 10),
        events,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(JSON.stringify({ status: "error", message: error.message }), {
      status: 500,
    });
  }
}
