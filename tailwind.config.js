/** Tailwind settings for the site. `npm run build` reads this. */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Wrap hover: utilities in @media (hover: hover) so tapped elements on phones don't stay "hovered".
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        bryant: {
          black: '#000000',
          night: '#070707',
          carbon: '#0A0A0A',
          graphite: '#141414',
          bone: '#F2EEE4',
          ink: '#0A0A0A',
          gold: '#826E38',
          'gold-light': '#B39A5A',
          'gold-pale': '#D9C38A',
          'gold-deep': '#6B5A2D',
          mist: '#A39C8E',
          smoke: '#CFC9BC',
          label: '#8C8574',
          stone: '#5A5446',
          line: '#262626',
          signal: '#FF2A1F'
        }
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['Archivo', 'system-ui', 'sans-serif']
      },
      transitionTimingFunction: {
        lux: 'cubic-bezier(.2,.7,.2,1)',
        snap: 'cubic-bezier(.4,0,.2,1)'
      }
    }
  }
};
