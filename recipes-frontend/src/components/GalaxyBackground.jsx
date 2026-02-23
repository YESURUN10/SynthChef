import Galaxy from './Galaxy';

function GalaxyBackground() {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -10, /* Locks it safely behind your glowing UI */
        backgroundColor: '#020204', /* Deep space black */
        pointerEvents: 'none', /* Allows you to click the recipe cards */
        overflow: 'hidden'
      }}
    >
      <Galaxy 
        starSpeed={0.5}
        hueShift={180}
        mouseRepulsion={true}
      />
    </div>
  );
}

export default GalaxyBackground;