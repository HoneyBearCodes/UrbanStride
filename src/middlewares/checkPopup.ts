import { RequestHandler } from 'express';

const checkPopupAcknowledgement: RequestHandler = (req, res, next) => {
  const popupAcknowledged = req.session.popupAcknowledged;

  if (!popupAcknowledged) {
    res.locals.showPopup = true;
  } else {
    res.locals.showPopup = false;
  }

  next();
};

export default checkPopupAcknowledgement;
