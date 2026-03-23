import ZAI from 'z-ai-web-dev-sdk';

async function searchRicoAnimations() {
  try {
    const zai = await ZAI.create();

    console.log('Searching for Rico Animations software information...\n');

    // Search for what software Rico Animations uses
    const results = await zai.functions.invoke('web_search', {
      query: 'Rico Animations YouTube what animation software does he use create videos',
      num: 15
    });

    console.log('=== SEARCH RESULTS ===\n');
    
    if (Array.isArray(results)) {
      for (const result of results) {
        console.log(`Title: ${result.name}`);
        console.log(`URL: ${result.url}`);
        console.log(`Snippet: ${result.snippet}`);
        console.log(`Date: ${result.date}`);
        console.log('---');
      }
    } else {
      console.log('Results:', JSON.stringify(results, null, 2));
    }

    // Additional search for animation tools similar to Rico's style
    console.log('\n\n=== ADDITIONAL SEARCH: 2D Animation Tools for YouTube ===\n');
    
    const toolsResults = await zai.functions.invoke('web_search', {
      query: 'best 2D animation software for YouTube Shorts stickman meme animations',
      num: 10
    });

    if (Array.isArray(toolsResults)) {
      for (const result of toolsResults) {
        console.log(`Title: ${result.name}`);
        console.log(`URL: ${result.url}`);
        console.log(`Snippet: ${result.snippet}`);
        console.log('---');
      }
    }

  } catch (error) {
    console.error('Search failed:', error);
  }
}

searchRicoAnimations();
