import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function cleanText(text: string) {
    return text.replace(/\s+/g, ' ').trim();
}

async function scrapeEventDetails(link: string) {
    try {
        const response = await fetch(link);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Title
        const title = cleanText($('h1.entry-title').text() || $('h1').text());

        // We can get image
        let cover_image_url = $('meta[property="og:image"]').attr('content');
        if (!cover_image_url) {
            cover_image_url = $('.entry-content img').first().attr('src');
        }

        // We can get description
        let description = '';
        $('.entry-content p').each((i, el) => {
            description += cleanText($(el).text()) + '\n\n';
        });
        description = description.trim();

        // Let's create a generic event with default start/end dates if we can't parse exactly
        // Let's set it to some future date or parse the date from title if possible, or just set to tomorrow.
        const starts_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        let location = "Japão";
        if (title.includes('HAMAMATSU') || title.toLowerCase().includes('shizuoka')) location = 'Hamamatsu, Shizuoka';
        if (title.includes('AICHI') || title.toLowerCase().includes('toyota')) location = 'Aichi';
        if (title.includes('MIE') || title.toLowerCase().includes('suzuka')) location = 'Mie';
        if (title.includes('GUNMA') || title.toLowerCase().includes('ota')) location = 'Gunma';
        if (title.includes('SHIGA')) location = 'Shiga';

        // generate a slug
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

        return {
            title,
            slug,
            description,
            location,
            starts_at,
            cover_image_url,
            contact_url: link, // Link original
            status: 'published' as const
        };
    } catch (err) {
        console.error(`Failed to scrape ${link}:`, err);
        return null;
    }
}

async function scrapeEvents() {
  const url = "https://business.portalmie.com/?_gl=1*12tp2c*_gcl_aw*R0NMLjE3NzMxMTk0ODEuQ2owS0NRanczN25OQmhEa0FSSXNBRUJHSThQNy12ZzRqcHgyMkpiaEpweHM4QlUtdU5GbGxlbWRKVEtzTjFfcGMxU0dHak5VRm9hY1k0MGFBcHA3RUFMd193Y0I.*_gcl_au*NjE0MjkyMTc1LjE3NzMxMTk0Njk.*_ga*MTc2NTQ4NzIzMi4xNzczMTE5NDY5*_ga_6LX6H8X6KS*czE3NzMxMTk1MDIkbzEkZzEkdDE3NzMxMTk1MTckajQ1JGwwJGgw";

  try {
    console.log(`Fetching main page...`);
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const eventLinks: string[] = [];
    
    $('article, .td_module_wrap, .post').each((i, el) => {
        const a = $(el).find('h3.entry-title a').first();
        const link = a.attr('href') || $(el).find('a').first().attr('href');
        if (link && !eventLinks.includes(link) && link.includes('business.portalmie.com')) {
             eventLinks.push(link);
        }
    });

    console.log(`Found ${eventLinks.length} event links.`);
    
    let addedCount = 0;

    for (const link of eventLinks) {
        console.log(`Scraping: ${link}`);
        const eventData = await scrapeEventDetails(link);
        
        if (eventData && eventData.title) {
            console.log(`Inserting: ${eventData.title}`);
            const { data, error } = await supabase
                .from('calendar_events')
                .insert([eventData])
                .select();
                
            if (error) {
                console.error("Error inserting:", error.message);
            } else {
                console.log("Success ->", data?.[0]?.slug);
                addedCount++;
            }
        }
    }
    
    console.log(`\nFinished! Added ${addedCount} events.`);

  } catch (error) {
    console.error("Error scraping events:", error);
  }
}

scrapeEvents();
