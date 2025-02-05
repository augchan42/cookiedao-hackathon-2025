const DEFAULT_GROK_PATTERNS = {
    IP: /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
    NUMBER: /-?\d+(\.\d+)?/,
    WORD: /\b\w+\b/,
    TIMESTAMP: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/,
    UUID: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
    HTTPMETHOD: /GET|POST|PUT|DELETE|PATCH/,
};
export function grokParse(logLine, pattern, customPatterns = {}) {
    const combinedPatterns = { ...DEFAULT_GROK_PATTERNS, ...customPatterns };
    // Replace Grok syntax with regex patterns
    const regexPattern = pattern.replace(/%{(\w+)(?::(\w+))?}/g, (_, patternName, fieldName) => {
        const regex = combinedPatterns[patternName];
        if (!regex)
            throw new Error(`Undefined pattern: ${patternName}`);
        return `(?${fieldName ? `<${fieldName}>` : ':'}${regex.source})`;
    });
    const match = new RegExp(regexPattern).exec(logLine);
    if (!match)
        return {};
    return Object.fromEntries(Object.entries(match.groups || {})
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, value || null]));
}
export async function simulateLogStream(logs, pattern, intervalMs = 1000) {
    for (const logLine of logs) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        const parsed = grokParse(logLine, pattern);
        console.log(`[${new Date().toISOString()}] Processed log:`);
        console.dir(parsed, { colors: true });
    }
}
// Example usage
const sampleLogs = [
    '2023-10-05 12:34:56 192.168.1.1 GET /index.html 200',
    '2023-10-05 12:35:01 10.0.0.1 POST /login 401',
    'error: 8e35dac9-0034-4e3a-826a-8e8949d55133 failed to connect',
];
const grokPattern = '%{TIMESTAMP} %{IP:client} %{HTTPMETHOD:method} %{WORD:path} %{NUMBER:status}';
simulateLogStream(sampleLogs, grokPattern)
    .then(() => console.log('Stream processing complete'))
    .catch(console.error);
