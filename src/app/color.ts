export function getTrackColor(name: string) {
  const colors = [
    "#E74694",
    "#E02424",
    "#FF5A1F",
    "#FACA15",
    "#31C48D",
    "#16BDCA",
    "#1C64F2",
    "#6875F5",
    "#9061F9",
    "#64C6CA",
    "#FF5083",
    "#003153",
    "#D2b48c",
    "#E97451",
    "#Ffef00",
    "#9acd32",
  ];

  let total = 0;

  for (const letter of name.split("")) {
    total += letter.charCodeAt(0);
  }

  return colors[
    Math.floor(parseFloat(`0.${total.toFixed(0)}`) * colors.length)
  ];
}
