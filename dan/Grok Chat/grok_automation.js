require('dotenv').config();
const puppeteer = require('puppeteer');

async function loginToXAndUseGrok(query) {
    const browser = await puppeteer.launch({
        headless: false, // Keep the browser visible
        defaultViewport: null,
        args: [
            '--start-maximized',
            '--disable-blink-features=AutomationControlled' // Hide Puppeteer from detection
        ],
        slowMo: 50 // Add slight delay between actions
    });

    try {
        const page = await browser.newPage();

        // Set a random user agent
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
        await page.setUserAgent(userAgent);

        // Enable better logging
        page.on('console', msg => console.log('Browser console:', msg.text()));

        // Navigate to X login page
        console.log('Navigating to X login page...');
        await page.goto('https://twitter.com/i/flow/login', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for and fill username
        console.log('Waiting for username field...');
        await page.waitForSelector('input[autocomplete="username"]', {
            visible: true,
            timeout: 10000
        });
        console.log('Entering username...');
        await page.type('input[autocomplete="username"]', process.env.X_USERNAME, { delay: 100 });

        // Simulate pressing "Next" instead of "Enter"
        console.log('Clicking "Next" button...');
        let nextButtonClicked = false;
        try {
            await page.click('div[role="button"]:has-text("Next")'); // Look for a "Next" button
            nextButtonClicked = true;
        } catch (e) {
            console.log('No "Next" button found, trying to press Enter...');
        }

        if (!nextButtonClicked) {
            console.log('Pressing Enter...');
            await page.keyboard.press('Enter');
        }

        // Debug current page state
        console.log('After username, waiting for next step...');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'after-username.png' }); // Take a screenshot for debugging

        // Handle "Unusual Activity" Page
        try {
            console.log('Checking for unusual activity page...');
            await page.waitForSelector('input[name="text"]', { timeout: 5000 }); // Example selector for CAPTCHA or email input
            console.error('Unusual activity detected! Please solve the challenge manually.');
            await page.waitForTimeout(60000); // Pause for manual intervention
        } catch (e) {
            console.log('No unusual activity page detected.');
        }

        // Check for email confirmation step
        let emailField = null;
        try {
            console.log('Checking for email confirmation step...');
            emailField = await page.waitForSelector('input[autocomplete="email"]', { timeout: 5000 });
        } catch (e) {
            console.log('No email confirmation step detected.');
        }

        if (emailField) {
            console.log('Email confirmation step detected...');
            await page.type('input[autocomplete="email"]', process.env.X_EMAIL, { delay: 100 });
            await page.waitForTimeout(1000);
            await page.keyboard.press('Enter');
        }

        // Retry finding the password field
        console.log('Looking for password field...');
        const passwordSelectors = [
            'input[name="password"]',
            'input[type="password"]',
            'input[autocomplete="current-password"]'
        ];
        let passwordField = null;
        for (let attempt = 0; attempt < 5 && !passwordField; attempt++) {
            for (const selector of passwordSelectors) {
                try {
                    passwordField = await page.waitForSelector(selector, {
                        visible: true,
                        timeout: 5000
                    });
                    if (passwordField) {
                        console.log(`Found password field with selector: ${selector}`);
                        break;
                    }
                } catch (e) {
                    console.log(`Selector ${selector} not found, trying next...`);
                }
            }
            if (!passwordField) {
                console.log(`Password field not found on attempt ${attempt + 1}, retrying...`);
                await page.waitForTimeout(2000); // Wait before retrying
            }
        }

        if (!passwordField) {
            console.error('Password field not found!');
            // Take a screenshot for debugging
            await page.screenshot({ path: 'debug-screenshot.png' });
            throw new Error('Could not find password field');
        }

        // Enter password
        console.log('Entering password...');
        await passwordField.type(process.env.X_PASSWORD, { delay: 100 });
        await page.waitForTimeout(1000);
        await page.keyboard.press('Enter');

        // Wait for login to complete
        console.log('Waiting for login to complete...');
        await page.waitForNavigation({
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Navigate to Grok
        console.log('Successfully logged in, navigating to Grok...');
        await page.goto('https://grok.x.ai/', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for and click the chat input
        console.log('Looking for chat input...');
        await page.waitForSelector('div[contenteditable="true"]', {
            visible: true,
            timeout: 10000
        });
        await page.click('div[contenteditable="true"]');

        // Type the query
        console.log('Entering query:', query);
        await page.keyboard.type(query);
        await page.waitForTimeout(1000);
        await page.keyboard.press('Enter');

        // Wait for response
        console.log('Waiting for Grok response...');
        await page.waitForTimeout(5000);

        // Extract the latest response
        const response = await page.evaluate(() => {
            const messages = document.querySelectorAll('.message-content');
            return messages[messages.length - 1].textContent;
        });

        console.log('Grok Response:', response);
        return response;

    } catch (error) {
        console.error('An error occurred:', error);
        // Take a screenshot when an error occurs
        await page.screenshot({ path: 'error-screenshot.png' });
        throw error;
    } finally {
        // Keep the browser open for debugging
        // await browser.close();
    }
}

// Example usage
const query = process.argv[2] || "Tell me a joke";
loginToXAndUseGrok(query)
    .then(response => {
        console.log('Task completed successfully');
    })
    .catch(console.error);