import axios from "axios";
import { parseStringPromise } from "xml2js";

export async function fetchJobsFromUrl(url) {
  const r = await axios.get(url, { timeout: 15000 });
  // console.log('data api', r)
  const xmlData = r.data;
  const json = await parseStringPromise(xmlData, {
    explicitArray: false,
    mergeAttrs: true,
  });
  // console.log(json);
  let items = [];
  try {
    if (json.rss && json.rss.channel && json.rss.channel.item) {
      items = Array.isArray(json.rss.channel.item)
        ? json.rss.channel.item
        : [json.rss.channel.item];
    } else if (json.feed && json.feed.entry) {
      items = Array.isArray(json.feed.entry)
        ? json.feed.entry
        : [json.feed.entry];
    }
  } catch (e) {
    // console.log(e);
    items = [];
  }

  const newData = items.map((it) => ({
    jobId: it.guid || "",
    title: it.title || "",
    company: it.company || "",
    location: it.location || "",
    description: it.description || "",
    link: it.link || "",
    raw: it,
  }));
  return newData.filter((i) => i.jobId);
}
