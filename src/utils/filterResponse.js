const menuData = (menu, items) => {
  const categories = {};

  items.forEach((item) => {
    if (item) {
      const { menuId, category, ...nItem } = item;

      if (!categories[category]) {
        categories[category] = {
          name: category,
          items: [],
        };
      }

      categories[category].items.push({ ...nItem, id: item.id });
    }
  });

  return {
    id: menu.id,
    name: menu.name,
    categories: Object.values(categories),
  };
};

/*
 * must always include event - client side
 * maybe create another one for venue side
 */
const reservationData = (reservations) => {
  const filterStatus = (res, event) => {
    let status;

    if (event[0].status == "cancelled") return "Event Cancelled";
    switch (res.reservationStatus) {
      case "cancelled":
        status = "Cancelled";
        break;
      case "declined":
        status = "Declined";
        break;
      case "pending":
        if (event[0].status != "pending") status = "Declined";
        else status = "Pending";
        break;
      case "approved":
        if (event[0].status == "pending") status = "Accepted";
        else if (event[0].status == "ongoing") status = "Active";
        else status = "Completed";
        break;
    }
    return status;
  };

  // TODO: complete filterDate to display as desired.
  // const filterDate = (date, time) => { }

  const filteredReservations = reservations.map((res) => {
    const event = eventData(res.event);

    // const date = filterDate(res.reservationTime, res.event.startDate);
    const date = event[0].starts;

    return {
      id: res.reservationId,
      typeId: res.reservationTypeId,
      name: res.reservationName,
      tickets: res.numTicketPurchased,
      guests: res.guestNum,
      paid: res.paid, // we may don't need
      status: filterStatus(res, event),
      dateTime: date,
      type: res.type,
      minCharge: res.minimumCharge,
      event: event[0],
    };
  });
  return filteredReservations;
};

const eventData = (events) => {
  // TODO: Create filterAddress to create address as required
  // may be better to do this on frontend to help when editing event details

  const filteredEvents = events.map((event) => {
    return {
      id: event.eventId,
      venueId: event.venueId,
      menuId: event.menuId,
      title: event.title,
      info: event.shortDescription,
      description: event.description,
      image: event.imagePath,
      createdAt: event.createdAt,
      starts: event.startDateTime,
      closes: event.endDateTime,
      preOrderDeadline: event.preOrderDeadline,
      acceptingReservations: event.acceptingReservations,
      status: event.eventStatus,
      facebook: event.facebook,
      twitter: event.twitter,
      instagram: event.instagram,
      price: event.price,
    };
  });

  return filteredEvents;
};

module.exports = {
  menuData,
  reservationData,
  eventData,
};
