import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.NEWSAPI);

type NewsResponse = {
    status: string;
    totalResults: number;
    articles: Array<Article>;
}

type Article = {
    source: Object;
    author: string;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    content: string;
}

const news = newsapi.v2.topHeadlines({
    category: 'business', // business, entertainment, general, health, science, sports, technology
    language: 'en',
    country: 'us'
  })

async function extractArticle(url: string): Promise<any> {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    return article;
  }

// news.then((res: NewsResponse) => {
//     const url_test = res.articles[0].url;
//     return 
// });

const url = "https://www.computerweekly.com/news/366628213/Data-resilience-critical-as-ransomware-attacks-target-backups"

// 사용 예시
extractArticle(url)
  .then(article => {
    console.log('제목:', article.title);
    console.log('내용:', article.content);
    console.log('텍스트만:', article.textContent);
  })
  .catch(err => console.error('에러:', err));

//   title: article title
//   content: HTML string of processed article content
//   textContent: text content of the article (all HTML removed)
//   length: length of an article, in characters
//   excerpt: article description, or short excerpt from the content
//   byline: author metadata
//   dir: content direction