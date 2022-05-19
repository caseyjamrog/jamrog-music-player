const iconStyles = {
    fontSize: '42px',
    fontWeight: 500,
    background: 'transparent',
    color: 'limegreen'
  }

const defaultTrackObj = {
  album: {},
  artists: [],
  available_markets: [],
  disc_number: null,
  duration_ms: 0,
  explicit: false,
  external_ids: {},
  external_urls: {},
  href: "",
  id: "",
  is_local: false,
  name: "",
  popularity: 0,
  preview_url: "",
  track_number: 1,
  type: "track",
  uri: ""
}

const defaultModifierObj = {
  energy: {
    disabled: true,
    value: 0,
    min: '0',
    max: '1', 
    step: '.01'
  },
  danceability: {
    disabled: true,
    value: 0,
    min: '0',
    max: '1', 
    step: '.01'
  },
  acousticness: {
    disabled: true,
    value: 0,
    min: '0',
    max: '1', 
    step: '.01'
  },
  tempo: {
    disabled: true,
    value: 0,
    min: '0',
    max: '200', 
    step: '1'
  },
  valence: {
    disabled: true,
    value: 0,
    min: '0',
    max: '1', 
    step: '.01'
  }
};

const getCookie = (cname) => {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export { defaultModifierObj, defaultTrackObj, iconStyles, getCookie}