const menuData = (item, menuId, category, newItem=false) => {
  return data = {
    id: newItem?.id || item.id,
    menuId: menuId,
    category: category,
    name: item.name,
    price: item.price,
    description: item?.description || 'Description Example',
    stock: item?.stock ?? true, // for testing null will be assigned to true
    sides: item?.sides || 0,
    image: item?.image || 0
  }
}

const reservationData = (data) => {
  const event = eventData(data.event);
  const status = status => {
    let resStatus;
    switch(status) {
      case 'Approved': 
        resStatus = 'approved';
        break;
      case 'Cancelled': 
        resStatus = 'cancelled';
        break;
      case 'Event Cancelled': 
        resStatus = 'cancelled';
        break;
      case 'Pending': 
        resStatus = 'pending';
        break;
      case 'Declined': 
        resStatus = 'declined';
        break;
      case 'Active':
        resStatus = 'approved';
        break; 
      case 'Completed': 
        resStatus = 'approved';
        break;
    }
    return resStatus
  }

  return {
    reservationId: data.id,
    reservationTypeId: data.typeId,
    reservationName: data.name,
    numTicketPurchased: data.tickets,
    guestNum: data.guests,
    paid: data.paid, 
    reservationStatus: status(data.status),
    date: dateTime,
    type: data.type,
    minimumCharge: minCharge,
    event: event 
  };
};

const eventData = (data) => {
  return {
    eventId: data.id,
    venueId: data.venueId,
    menuId: data.menuId,
    title: data.title,
    description: data.description,
    imagePath: data.image,
    createdAt: data.createdAt,
    startDate: data.starts,
    endDate: data.closes,
    eventStatus: data.status,
    city: data.city,
    streetName: data.street,
    postCode: data.postCode,
    area: data.area,
    ticketPrice: data.ticketPrice,
    acceptingReservations: data.acceptingReservations,
    deposit: data.deposit
  }
};

module.exports = {
  menuData,
  reservationData
};