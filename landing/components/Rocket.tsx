export function Rocket() {
  return (
    <>
      <div className="relative h-full w-full">
        <a
          className="absolute bottom-2 right-2 text-xs text-[#ffffff65]"
          href="https://codepen.io/Dooove/pen/abbPjKw"
        >
          Credit to: https://codepen.io/Dooove/pen/abbPjKw
        </a>
        <span className="absolute left-[50%] top-[85%] z-[200] translate-x-[-50%] text-5xl text-[#ffffffa0]">
          Loading...
        </span>
      </div>
      <div id="loading-rocket-ce">
        <div className="rocket-ce">
          <span>
            <i className="wing-top"></i>
            <i className="wing-bottom"></i>
            <i className="flame"></i>
            <i className="wastes">
              <i></i>
              <i></i>
              <i></i>
              <i></i>
              <i></i>
            </i>
            <i className="lightspeed">
              <i></i>
              <i></i>
              <i></i>
              <i></i>
              <i></i>
            </i>
          </span>
        </div>
      </div>
    </>
  );
}
