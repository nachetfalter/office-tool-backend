export const cleanString = (string: string) => {
  return string
    .replace(
      /[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFFа-яА-Я一-龠ぁ-ゔァ-ヴー々〆〤\u0900-\u097F\u4e00-\u9fff\u3400-\u4dff\uf900-\ufaffα-ωΑ-Ω]+/gu,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim();
};

export const inicap = (string: string) => {
  return string.length > 1 ? string[0].toUpperCase() + string.slice(1).toLowerCase() : string[0].toUpperCase();
};
