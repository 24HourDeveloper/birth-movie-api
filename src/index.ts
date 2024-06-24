import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "bun";

const app = new Hono();

app.use("/*", cors());

app.get("/:date", async (c) => {
  const birth = c.req.param("date") ?? "2020-09-14";
  const year = birth.substring(0, 4);
  const month = birth.substring(5, 7);

  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&primary_release_year=${year}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    let birthdayMovie;
    const monthMovie = [];
    const yearMovie = [];

    for (let i = 0; i < data.results.length; i++) {
      let date = data.results[i].release_date;
      if (birth === date) {
        birthdayMovie = data.results[i];
      } else if (month === date.substring(5, 7)) {
        monthMovie.push(data.results[i]);
      } else {
        yearMovie.push(data.results[i]);
      }
    }

    return c.json({ birthdayMovie, monthMovie, yearMovie });
  } catch (error) {
    return c.json({ error: "Failed to fetch data" }, 500);
  }
});

serve({
  fetch: app.fetch,
  port: 3000,
});

export default app;
