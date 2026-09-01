import logoImg from '../received_856840846831133.jpeg'

export default function EgkLogo({ size = 64 }) {
  return (
    <img
      src={logoImg}
      alt="EGK — The Dark Knight"
      style={{ width: size, height: 'auto', display: 'block', margin: '0 auto' }}
    />
  )
}
