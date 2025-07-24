// api/edge-location.js
export const config = {
  runtime: 'edge',
};

export default function handler(request) {
  // Get user's location from Vercel Edge Network
  const country = request.headers.get('x-vercel-ip-country') || 'US';
  const city = request.headers.get('x-vercel-ip-city') || 'Unknown';
  const region = request.headers.get('x-vercel-ip-country-region') || 'Unknown';
  
  // Get user's timezone
  const timezone = request.headers.get('x-vercel-ip-timezone') || 'America/Los_Angeles';
  
  return new Response(
    JSON.stringify({
      location: {
        country,
        city,
        region,
        timezone
      },
      suggestedJobLocations: getSuggestedLocations(country, city),
      localJobMarkets: getLocalJobMarkets(country, region)
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, s-maxage=3600',
      },
    }
  );
}

function getSuggestedLocations(country, city) {
  const suggestions = {
    'US': {
      'San Francisco': ['San Francisco, CA', 'Bay Area, CA', 'Remote'],
      'New York': ['New York, NY', 'NYC Metro', 'Remote'],
      'Austin': ['Austin, TX', 'Texas Triangle', 'Remote'],
      'default': ['Remote', 'Your City', 'Nationwide']
    },
    'default': ['Remote', 'Your Country', 'Worldwide']
  };
  
  return suggestions[country]?.[city] || suggestions[country]?.default || suggestions.default;
}

function getLocalJobMarkets(country, region) {
  // Return relevant job market info based on location
  return {
    averageSalary: getAverageSalary(country, region),
    topCompanies: getTopCompanies(country, region),
    inDemandSkills: getInDemandSkills(country)
  };
}

function getAverageSalary(country, region) {
  const salaries = {
    'US': {
      'CA': '$120,000 - $180,000',
      'NY': '$110,000 - $170,000',
      'TX': '$100,000 - $150,000',
      'default': '$90,000 - $140,000'
    },
    'default': '$60,000 - $100,000'
  };
  
  return salaries[country]?.[region] || salaries[country]?.default || salaries.default;
}

function getTopCompanies(country, region) {
  // Return top tech companies by region
  const companies = {
    'US': {
      'CA': ['Google', 'Apple', 'Meta', 'OpenAI', 'Stripe'],
      'NY': ['Bloomberg', 'Goldman Sachs', 'MongoDB', 'Datadog'],
      'TX': ['Dell', 'Oracle', 'Tesla', 'Indeed', 'HomeAway'],
      'default': ['Microsoft', 'Amazon', 'IBM', 'Salesforce']
    },
    'default': ['Local Tech Companies', 'International Remote Companies']
  };
  
  return companies[country]?.[region] || companies[country]?.default || companies.default;
}

function getInDemandSkills(country) {
  const skills = {
    'US': ['React', 'Python', 'AWS', 'Machine Learning', 'TypeScript'],
    'default': ['JavaScript', 'Python', 'Cloud Computing', 'DevOps']
  };
  
  return skills[country] || skills.default;
}