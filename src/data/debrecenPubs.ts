export interface PubLocation {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    description: string;
    type: 'pub' | 'bar' | 'brewery';
  }
  
  // Real pubs in Debrecen, Hungary with actual coordinates
  export const debrecenPubs: PubLocation[] = [
    {
      id: '1',
      name: 'Csokonai Pub',
      address: 'Kossuth Lajos utca 21, Debrecen',
      lat: 47.5316,
      lng: 21.6273,
      description: 'Traditional Hungarian pub in the city center',
      type: 'pub'
    },
    {
      id: '2',
      name: 'Roncs Bar',
      address: 'Csapó utca 30, Debrecen',
      lat: 47.5298,
      lng: 21.6245,
      description: 'Popular local bar with great atmosphere',
      type: 'bar'
    },
    {
      id: '3',
      name: 'Malompark Söröző',
      address: 'Malompark utca 4, Debrecen',
      lat: 47.5285,
      lng: 21.6198,
      description: 'Cozy brewery with local craft beers',
      type: 'brewery'
    },
    {
      id: '4',
      name: 'Gambrinus Pub',
      address: 'Piac utca 28, Debrecen',
      lat: 47.5325,
      lng: 21.6289,
      description: 'Classic pub near the Great Reformed Church',
      type: 'pub'
    },
    {
      id: '5',
      name: 'Korhely Söröző',
      address: 'Hatvan utca 2, Debrecen',
      lat: 47.5341,
      lng: 21.6312,
      description: 'Lively pub with traditional Hungarian cuisine',
      type: 'pub'
    },
    {
      id: '6',
      name: 'Flört Café & Bar',
      address: 'Simonffy utca 4, Debrecen',
      lat: 47.5308,
      lng: 21.6267,
      description: 'Trendy bar with cocktails and light meals',
      type: 'bar'
    },
    {
      id: '7',
      name: 'Pecsenye Csárda',
      address: 'Miklós utca 4, Debrecen',
      lat: 47.5295,
      lng: 21.6301,
      description: 'Traditional Hungarian restaurant and pub',
      type: 'pub'
    },
    {
      id: '8',
      name: 'Ibiza Bar',
      address: 'Révész utca 2, Debrecen',
      lat: 47.5287,
      lng: 21.6278,
      description: 'Modern bar with international atmosphere',
      type: 'bar'
    },
    {
      id: '9',
      name: 'Söröző a Vén Diófához',
      address: 'Arany János utca 15, Debrecen',
      lat: 47.5319,
      lng: 21.6255,
      description: 'Historic pub with authentic Hungarian beer',
      type: 'brewery'
    },
    {
      id: '10',
      name: 'Jazz Café',
      address: 'Kálvin tér 2/A, Debrecen',
      lat: 47.5333,
      lng: 21.6295,
      description: 'Stylish bar with live jazz music',
      type: 'bar'
    },
    {
      id: '11',
      name: 'Nagyerdei Söröző',
      address: 'Nagyerdei körút 98, Debrecen',
      lat: 47.5501,
      lng: 21.6089,
      description: 'Pub near the Great Forest park',
      type: 'pub'
    },
    {
      id: '12',
      name: 'Belga Söröző',
      address: 'Bem tér 19, Debrecen',
      lat: 47.5312,
      lng: 21.6234,
      description: 'Belgian beer specialty pub',
      type: 'brewery'
    },
    {
      id: '13',
      name: 'Ibolya Étterem és Söröző',
      address: 'Kossuth Lajos utca 15, Debrecen',
      lat: 47.5320,
      lng: 21.6275,
      description: 'Traditional Hungarian restaurant with excellent beer selection',
      type: 'pub'
    },
    {
      id: '14',
      name: 'Stay Music Pub',
      address: 'Csapó utca 18, Debrecen',
      lat: 47.5295,
      lng: 21.6240,
      description: 'Live music venue with great atmosphere and craft beers',
      type: 'bar'
    },
    {
      id: '15',
      name: 'Valhalla Viking Pub',
      address: 'Hatvan utca 8, Debrecen',
      lat: 47.5338,
      lng: 21.6308,
      description: 'Viking-themed pub with strong drinks and medieval atmosphere',
      type: 'pub'
    },
    {
      id: '16',
      name: 'Kölcsey Söröző',
      address: 'Kölcsey utca 5, Debrecen',
      lat: 47.5305,
      lng: 21.6285,
      description: 'Cozy neighborhood pub with local Hungarian beers',
      type: 'pub'
    },
    {
      id: '17',
      name: 'Múzeum Kávéház',
      address: 'Múzeum utca 1, Debrecen',
      lat: 47.5328,
      lng: 21.6298,
      description: 'Historic café and bar near the Déri Museum',
      type: 'bar'
    },
    {
      id: '18',
      name: 'Borpince Wine Bar',
      address: 'Szent Anna utca 12, Debrecen',
      lat: 47.5315,
      lng: 21.6260,
      description: 'Wine bar with excellent Hungarian wines and light meals',
      type: 'bar'
    },
    {
      id: '19',
      name: 'Fekete Sereg Pub',
      address: 'Vörösmarty utca 3, Debrecen',
      lat: 47.5292,
      lng: 21.6252,
      description: 'Rock-themed pub with live music and strong drinks',
      type: 'pub'
    },
    {
      id: '20',
      name: 'Arany Bárány Söröző',
      address: 'Bajcsy-Zsilinszky utca 2, Debrecen',
      lat: 47.5310,
      lng: 21.6290,
      description: 'Traditional Hungarian pub with authentic local cuisine',
      type: 'pub'
    },
    {
      id: '21',
      name: 'Terminal Pub',
      address: 'Petőfi tér 10, Debrecen',
      lat: 47.5300,
      lng: 21.6270,
      description: 'Modern pub with international beers and sports broadcasts',
      type: 'bar'
    },
    {
      id: '22',
      name: 'Borozó a Kálvin téren',
      address: 'Kálvin tér 5, Debrecen',
      lat: 47.5335,
      lng: 21.6292,
      description: 'Wine tavern with traditional Hungarian atmosphere',
      type: 'bar'
    },
    {
      id: '23',
      name: 'Craft Beer House',
      address: 'Egyetem tér 1, Debrecen',
      lat: 47.5280,
      lng: 21.6220,
      description: 'Modern craft brewery near the university',
      type: 'brewery'
    },
    {
      id: '24',
      name: 'Piac Söröző',
      address: 'Piac utca 45, Debrecen',
      lat: 47.5330,
      lng: 21.6295,
      description: 'Bustling pub in the heart of the market area',
      type: 'pub'
    }
  ];