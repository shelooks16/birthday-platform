import { createIcon } from '@hope-ui/solid';

export const IconArrowLeft = createIcon({
  viewBox: '0 0 15 15',
  path: () => (
    <path
      d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z"
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />
  )
});

export const IconArrowRight = createIcon({
  viewBox: '0 0 15 15',
  defaultProps: {
    transform: 'scaleX(-1)'
  },
  path: () => (
    <path
      d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z"
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />
  )
});

export const IconEmail = createIcon({
  viewBox: '0 0 512 512',
  path: () => (
    <path
      d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"
      fill="currentColor"
    />
  )
});

export const IconTelegram = createIcon({
  viewBox: '0 0 496 512',
  path: () => (
    <path
      d="M248,8C111.033,8,0,119.033,0,256S111.033,504,248,504,496,392.967,496,256,384.967,8,248,8ZM362.952,176.66c-3.732,39.215-19.881,134.378-28.1,178.3-3.476,18.584-10.322,24.816-16.948,25.425-14.4,1.326-25.338-9.517-39.287-18.661-21.827-14.308-34.158-23.215-55.346-37.177-24.485-16.135-8.612-25,5.342-39.5,3.652-3.793,67.107-61.51,68.335-66.746.153-.655.3-3.1-1.154-4.384s-3.59-.849-5.135-.5q-3.283.746-104.608,69.142-14.845,10.194-26.894,9.934c-8.855-.191-25.888-5.006-38.551-9.123-15.531-5.048-27.875-7.717-26.8-16.291q.84-6.7,18.45-13.7,108.446-47.248,144.628-62.3c68.872-28.647,83.183-33.623,92.511-33.789,2.052-.034,6.639.474,9.61,2.885a10.452,10.452,0,0,1,3.53,6.716A43.765,43.765,0,0,1,362.952,176.66Z"
      fill="currentColor"
    />
  )
});

export const IconCalendar = createIcon({
  viewBox: '0 0 448 512',
  path: () => (
    <path
      d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192h80v56H48V192zm0 104h80v64H48V296zm128 0h96v64H176V296zm144 0h80v64H320V296zm80-48H320V192h80v56zm0 160v40c0 8.8-7.2 16-16 16H320V408h80zm-128 0v56H176V408h96zm-144 0v56H64c-8.8 0-16-7.2-16-16V408h80zM272 248H176V192h96v56z"
      fill="currentColor"
    />
  )
});

export const IconList = createIcon({
  viewBox: '0 0 512 512',
  path: () => (
    <path
      d="M40 48C26.7 48 16 58.7 16 72v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V72c0-13.3-10.7-24-24-24H40zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM16 232v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V232c0-13.3-10.7-24-24-24H40c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V392c0-13.3-10.7-24-24-24H40z"
      fill="currentColor"
    />
  )
});

export const IconChevronLeft = createIcon({
  viewBox: '0 0 320 512',
  path: () => (
    <path
      d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
      fill="currentColor"
    />
  )
});

export const IconChevronRight = createIcon({
  viewBox: '0 0 320 512',
  path: () => (
    <path
      d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
      fill="currentColor"
    />
  )
});

export const IconBell = createIcon({
  viewBox: '0 0 448 512',
  path: () => (
    <path
      d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
      fill="currentColor"
    />
  )
});

export const IconEdit = createIcon({
  viewBox: '0 0 512 512',
  path: () => (
    <path
      d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"
      fill="currentColor"
    />
  )
});

export const IconMoon = createIcon({
  viewBox: '0 0 15 15',
  path: () => (
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M2.9.5a.4.4 0 0 0-.8 0v.6h-.6a.4.4 0 1 0 0 .8h.6v.6a.4.4 0 1 0 .8 0v-.6h.6a.4.4 0 0 0 0-.8h-.6V.5zm3 3a.4.4 0 1 0-.8 0v.6h-.6a.4.4 0 1 0 0 .8h.6v.6a.4.4 0 1 0 .8 0v-.6h.6a.4.4 0 0 0 0-.8h-.6v-.6zm-4 3a.4.4 0 1 0-.8 0v.6H.5a.4.4 0 1 0 0 .8h.6v.6a.4.4 0 0 0 .8 0v-.6h.6a.4.4 0 0 0 0-.8h-.6v-.6zM8.544.982l-.298-.04c-.213-.024-.34.224-.217.4A6.57 6.57 0 0 1 9.203 5.1a6.602 6.602 0 0 1-6.243 6.59c-.214.012-.333.264-.183.417c.069.07.138.139.21.206l.072.066l.26.226l.188.148l.121.09l.187.131l.176.115c.12.076.244.149.37.217l.264.135l.26.12l.303.122l.244.086a6.568 6.568 0 0 0 1.103.26l.317.04l.267.02a6.6 6.6 0 0 0 6.943-7.328l-.037-.277a6.557 6.557 0 0 0-.384-1.415l-.113-.268l-.077-.166l-.074-.148a6.602 6.602 0 0 0-.546-.883l-.153-.2l-.199-.24l-.163-.18l-.12-.124l-.16-.158l-.223-.2l-.32-.26l-.245-.177l-.292-.19l-.321-.186l-.328-.165l-.113-.052l-.24-.101l-.276-.104l-.252-.082l-.325-.09l-.265-.06l-.292-.053zm1.86 4.318a7.578 7.578 0 0 0-.572-2.894a5.601 5.601 0 1 1-4.748 10.146a7.61 7.61 0 0 0 3.66-2.51a.749.749 0 0 0 1.355-.442a.75.75 0 0 0-.584-.732c.062-.116.122-.235.178-.355A1.25 1.25 0 1 0 10.35 6.2c.034-.295.052-.595.052-.9z"
      fill="currentColor"
    />
  )
});

export const IconSun = createIcon({
  viewBox: '0 0 15 15',
  path: () => (
    <path
      d="M7.5 0C7.77614 0 8 0.223858 8 0.5V2.5C8 2.77614 7.77614 3 7.5 3C7.22386 3 7 2.77614 7 2.5V0.5C7 0.223858 7.22386 0 7.5 0ZM2.1967 2.1967C2.39196 2.00144 2.70854 2.00144 2.90381 2.1967L4.31802 3.61091C4.51328 3.80617 4.51328 4.12276 4.31802 4.31802C4.12276 4.51328 3.80617 4.51328 3.61091 4.31802L2.1967 2.90381C2.00144 2.70854 2.00144 2.39196 2.1967 2.1967ZM0.5 7C0.223858 7 0 7.22386 0 7.5C0 7.77614 0.223858 8 0.5 8H2.5C2.77614 8 3 7.77614 3 7.5C3 7.22386 2.77614 7 2.5 7H0.5ZM2.1967 12.8033C2.00144 12.608 2.00144 12.2915 2.1967 12.0962L3.61091 10.682C3.80617 10.4867 4.12276 10.4867 4.31802 10.682C4.51328 10.8772 4.51328 11.1938 4.31802 11.3891L2.90381 12.8033C2.70854 12.9986 2.39196 12.9986 2.1967 12.8033ZM12.5 7C12.2239 7 12 7.22386 12 7.5C12 7.77614 12.2239 8 12.5 8H14.5C14.7761 8 15 7.77614 15 7.5C15 7.22386 14.7761 7 14.5 7H12.5ZM10.682 4.31802C10.4867 4.12276 10.4867 3.80617 10.682 3.61091L12.0962 2.1967C12.2915 2.00144 12.608 2.00144 12.8033 2.1967C12.9986 2.39196 12.9986 2.70854 12.8033 2.90381L11.3891 4.31802C11.1938 4.51328 10.8772 4.51328 10.682 4.31802ZM8 12.5C8 12.2239 7.77614 12 7.5 12C7.22386 12 7 12.2239 7 12.5V14.5C7 14.7761 7.22386 15 7.5 15C7.77614 15 8 14.7761 8 14.5V12.5ZM10.682 10.682C10.8772 10.4867 11.1938 10.4867 11.3891 10.682L12.8033 12.0962C12.9986 12.2915 12.9986 12.608 12.8033 12.8033C12.608 12.9986 12.2915 12.9986 12.0962 12.8033L10.682 11.3891C10.4867 11.1938 10.4867 10.8772 10.682 10.682ZM5.5 7.5C5.5 6.39543 6.39543 5.5 7.5 5.5C8.60457 5.5 9.5 6.39543 9.5 7.5C9.5 8.60457 8.60457 9.5 7.5 9.5C6.39543 9.5 5.5 8.60457 5.5 7.5ZM7.5 4.5C5.84315 4.5 4.5 5.84315 4.5 7.5C4.5 9.15685 5.84315 10.5 7.5 10.5C9.15685 10.5 10.5 9.15685 10.5 7.5C10.5 5.84315 9.15685 4.5 7.5 4.5Z"
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />
  )
});

export const IconTimes = createIcon({
  viewBox: '0 0 384 512',
  path: () => (
    <path
      d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
      fill="currentColor"
    />
  )
});

export const IconUserCircle = createIcon({
  viewBox: '0 0 512 512',
  path: () => (
    <path
      d="M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z"
      fill="currentColor"
    />
  )
});

export const IconGoogle = createIcon({
  viewBox: '0 0 488 512',
  path: () => (
    <path
      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      fill="currentColor"
    />
  )
});

export const IconLogoLoader = createIcon({
  viewBox: '0 0 272 276',
  path: () => (
    <g
      transform="translate(0.000000,276.000000) scale(0.100000,-0.100000)"
      fill="currentColor"
      stroke="none"
    >
      <path d="M345 2608 c-3 -7 -4 -404 -3 -883 l3 -870 270 -5 270 -5 5 -342 c3 -234 9 -346 16 -353 8 -8 148 -10 505 -7 551 4 579 7 719 74 259 124 347 441 189 677 -50 76 -90 112 -153 142 -20 10 -36 20 -36 24 0 3 16 14 35 24 46 25 117 102 146 157 17 34 23 67 27 140 8 164 -25 257 -128 360 -100 101 -223 153 -395 166 l-72 6 25 60 c22 55 24 71 19 166 -3 76 -11 122 -26 161 -68 170 -231 282 -453 310 -125 15 -957 13 -963 -2z m975 -325 c51 -24 104 -75 119 -116 17 -44 13 -125 -6 -159 -10 -16 -36 -39 -58 -50 -82 -43 -127 -48 -417 -48 l-278 0 0 201 0 201 298 -4 c277 -4 300 -5 342 -25z m507 -694 c107 -21 173 -100 173 -206 0 -75 -23 -113 -87 -144 -46 -23 -60 -24 -293 -29 l-245 -5 -3 -142 c-3 -141 -2 -143 20 -147 13 -3 111 -7 218 -10 163 -4 205 -8 255 -26 80 -28 129 -61 162 -112 23 -34 28 -53 28 -103 0 -52 -4 -67 -29 -99 -34 -45 -109 -83 -193 -96 -32 -6 -181 -10 -330 -10 l-273 0 -2 503 -3 502 -165 0 -165 0 -3 -147 -3 -148 -104 0 -105 0 0 221 0 221 548 -7 c301 -3 570 -11 599 -16z" />
    </g>
  )
});
