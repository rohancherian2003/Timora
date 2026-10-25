import { Router } from 'express';
import { enquiriesController } from './enquiries.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  createEnquirySchema,
  createOfferSchema,
  sendMessageSchema,
} from './enquiries.schema.js';

export const enquiriesRouter = Router();

enquiriesRouter.use(authenticate);

// Create enquiry
enquiriesRouter.post(
  '/',
  validate(createEnquirySchema),
  enquiriesController.createEnquiry.bind(enquiriesController)
);

// View enquiry & negotiations
enquiriesRouter.get(
  '/:id',
  enquiriesController.getEnquiry.bind(enquiriesController)
);

// Make offer/counteroffer
enquiriesRouter.post(
  '/:id/offers',
  validate(createOfferSchema),
  enquiriesController.makeOffer.bind(enquiriesController)
);

// Accept offer
enquiriesRouter.patch(
  '/:id/offers/:offerId/accept',
  enquiriesController.acceptOffer.bind(enquiriesController)
);

// Post chat message in conversation
enquiriesRouter.post(
  '/:id/messages',
  validate(sendMessageSchema),
  enquiriesController.sendMessage.bind(enquiriesController)
);
