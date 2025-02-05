import puppeteer, { Browser, Page, Protocol } from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

interface TwitterCredentials {
    cookies?: Protocol.Network.CookieParam[];
}

interface GrokResponse {
    text: string;
    timestamp: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function setupBrowser(): Promise<Browser> {
    return await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        defaultViewport: { width: 1280, height: 800 }
    });
}

async function setupAuthentication(page: Page, credentials: TwitterCredentials): Promise<void> {
    if (!credentials.cookies || credentials.cookies.length === 0) {
        throw new Error('Cookies are required for authentication');
    }

    await page.setCookie(...credentials.cookies);
}

async function searchGrok(query: string, retryCount = 0): Promise<GrokResponse[]> {
    try {
        // Create required cookies
        const cookies: Protocol.Network.CookieParam[] = [
            {
                name: 'auth_token',
                value: process.env.TWITTER_AUTH_TOKEN || '',
                domain: '.x.com',
                path: '/',
            },
            {
                name: 'ct0',
                value: process.env.TWITTER_CT0 || '',
                domain: '.x.com',
                path: '/',
            }
        ];

        const credentials: TwitterCredentials = {
            cookies
        };

        const browser = await setupBrowser();
        const page = await browser.newPage();

        // Set up authentication with cookies
        await setupAuthentication(page, credentials);

        // Navigate directly to Grok
        await page.goto('https://x.com/i/grok', { 
            waitUntil: ['networkidle0', 'domcontentloaded'],
            timeout: 30000 
        });
        
        // Check if we're still on the login page
        const currentUrl = page.url();
        if (currentUrl.includes('/login')) {
            throw new Error('Authentication failed. Please check your auth_token.');
        }

        // Wait for Grok to be fully loaded
        await page.waitForFunction(() => {
            const input = document.querySelector('textarea[placeholder="Ask anything"]');
            return input && window.getComputedStyle(input).display !== 'none';
        }, { timeout: 10000 });

        // Type the query with a small delay between characters
        const input = await page.waitForSelector('textarea[placeholder="Ask anything"]');
        if (!input) {
            throw new Error('Could not find Grok search input');
        }
        
        // Clear any existing text and focus the input
        await input.click();
        await input.focus();
        
        // Type the query with a delay
        for (const char of query) {
            await page.type('textarea[placeholder="Ask anything"]', char, { delay: 100 });
        }
        
        await page.keyboard.press('Enter');

        // Wait for results to load
        console.log('Waiting for results...');
        
        // Wait for the copy button to appear (this indicates the response is complete)
        await page.waitForSelector('button[aria-label="Share"]', { timeout: 30000 })
            .catch(() => console.log('No Share button found after timeout'));

        // Extract results using the original working selector logic
        const results = await page.evaluate(async () => {
            const responses: GrokResponse[] = [];
            
            // Find all message containers using the original selector
            const messageContainers = document.querySelectorAll('div[class*="css-175oi2r"][class*="r-1awozwy"]');
            
            for (const container of messageContainers) {
                const shareButton = container.querySelector('button[aria-label="Share"]');
                if (shareButton) {
                    // This is a Grok response container
                    const textContent = container.textContent || '';
                    if (textContent.trim()) {
                        responses.push({
                            text: textContent.trim(),
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            }
            
            return responses;
        });

        console.log('Found messages:', results.length);
        
        // Keep window open for inspection if needed
        console.log('Window will stay open for 30 seconds for inspection...');
        await page.waitForTimeout(30000);

        // Don't close the browser automatically
        // await browser.close(); // Commented out to keep window open
        
        return results;

    } catch (error) {
        console.error(`Error during Grok search (attempt ${retryCount + 1}):`, error);
        
        // Retry logic
        if (retryCount < MAX_RETRIES) {
            console.log(`Retrying in ${RETRY_DELAY/1000} seconds... (${retryCount + 1}/${MAX_RETRIES})`)
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return searchGrok(query, retryCount + 1);
        }
        
        throw error;
    }
}

async function main() {
    const query = process.env.GROK_QUERY || 'What is the meaning of life?';
    try {
        const results = await searchGrok(query);
        console.log('Grok Results:');
        results.forEach((response, index) => {
            console.log(`\nResponse ${index + 1}:`);
            console.log(`Time: ${response.timestamp}`);
            console.log(`Text: ${response.text}`);
        });
    } catch (error) {
        console.error('Failed to execute Grok search:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
