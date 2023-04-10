import format from "date-fns/format";
import en from "date-fns/locale/en-US";

const formatDate = (date) => {
  return format(Date.parse(date), "dd MMMM, yyyy | HH:mm:ss", {
    locale: en,
  });
};

export default formatDate;
