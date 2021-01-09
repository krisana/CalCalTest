const { count } = require('console')
const fs = require('fs')

class Command {
  constructor(name, params) {
    this.name = name
    this.params = params
  }
}

function main() {
  const filename = 'input.txt'
  const commands = getCommandsFromFileName(filename)
  let rooms = [];
  let books = [];
  let checkouts = [];
  let keycards = [];
  let keycardNumber = 0;
  commands.forEach(command => {
    switch (command.name) {
      case 'create_hotel':
        const [floor, roomPerFloor] = command.params
        const hotel = { floor, roomPerFloor }
        const keycardTotal = floor * roomPerFloor;
        keycards = getKeycard(keycardTotal);
        rooms = getRooms(hotel);
        console.log(
          `Hotel created with ${floor} floor(s), ${roomPerFloor} room(s) per floor.`
        )
        return
      case 'book':
        if (rooms.length <= 0) return;
        const [room, name, age] = command.params;
        const [booked] = books.filter((data) => { return data.room == room });
        if (booked) {
          console.log(
            `Cannot book room ${room} for ${name}, The room is currently booked by ${booked.name}.`
          )
        } else {
          if (books.length <= 0) {
            keycardNumber = 1
          } else {
            const b = [];
            books.map((v) => b.push(v.keycardNumber))
            const currentKeycards = keycards.filter(function (el) {
              return !b.includes(el);
            });
            keycardNumber = currentKeycards[0];
          }
          const guest = {
            keycardNumber,
            room,
            name,
            age
          }
          console.log(
            `Room ${room} is booked by ${name} with keycard number ${keycardNumber}.`
          )
          books.push(guest)
          rooms = rooms.filter((n) => { return n != room });
        }
        return
      case 'checkout':
        if (rooms.length <= 0) return;
        const [checkoutKeycard, guestCheckoutName] = command.params;
        const [checkedout] = books.filter((data) => { return data.keycardNumber == checkoutKeycard });
        if (!checkedout) {
          console.log(
            `Not found keycard number ${checkoutKeycard}.`
          )
          return
        }
        if (checkedout.name != guestCheckoutName) {
          console.log(
            `Only ${checkedout.name} can checkout with keycard number ${checkedout.keycardNumber}.`
          )
        } else {
          console.log(
            `Room ${checkedout.room} is checkout.`
          )
          checkouts = checkouts.filter((v) => v.room !== checkedout.room)
          checkouts.push(checkedout)
          rooms.push(checkedout.room)
          books = books.filter((checkout) => { return checkout.room != checkedout.room });
        }
        return
      case 'list_available_rooms':
        if (rooms.length <= 0) return;
        console.log(rooms.join(", "))
        return
      case 'list_guest':
        if (rooms.length <= 0) return;
        console.log(arrComma(books, "name"));
        return
      case 'get_guest_in_room':
        if (rooms.length <= 0) return;
        const [guestInRoom] = command.params;
        const [guest] = books.filter((data) => { return data.room == guestInRoom });
        if (guest) {
          console.log(guest.name);
        } else {
          console.log(
            `Not found data in room ${room}.`
          )
        }
        return
      case 'list_guest_by_age':
        if (rooms.length <= 0) return;
        const [condition, guestByAge] = command.params;
        const guestAges = books.filter((data) => compare(data.age, condition, guestByAge));
        console.log(arrComma(guestAges, "name"));
        return
      case 'list_guest_by_floor':
        if (rooms.length <= 0) return;
        const [listByFloor] = command.params;
        const listGuestByFloor = books.filter((data) => {
          const strRoom = "" + data.room;
          return parseInt(strRoom.charAt(0)) == listByFloor
        });
        console.log(arrComma(listGuestByFloor, "name"));
        return
      case 'checkout_guest_by_floor':
        if (rooms.length <= 0) return;
        const [guestByFloor] = command.params;
        const getCheckouts = checkouts.filter((data) => {
          const strRoom = "" + data.room;
          return parseInt(strRoom.charAt(0)) == guestByFloor
        });
        if (getCheckouts.length <= 0) {
          console.log(
            `No guest checkout.`
          );
          return
        } else {
          console.log(
            `Room ${arrComma(getCheckouts, "room")} are checkout.`
          );
        }
        return
      case 'book_by_floor':
        if (rooms.length <= 0) return;
        const [byFloor, byGuestName, byAge] = command.params;
        const bookByFloors = books.filter((data) => {
          const strRoom = "" + data.room;
          return parseInt(strRoom.charAt(0)) == byFloor && data.name == byGuestName
        });
        if (bookByFloors.length > 0) {
          console.log(
            `Room ${arrComma(bookByFloors, "room")} are booked with keycard number ${arrComma(bookByFloors, "keycardNumber")}`
          )
        } else {
          console.log(`Cannot book floor ${byFloor} for ${byGuestName}.`)
        }
        return
      default:
        return
    }
  })
}

function getKeycard(keycardTotal) {
  let arr = [];
  for (let i = 1; i <= keycardTotal; i++) {
    arr.push(i)
  }
  return arr;
}

function arrComma(lists, field) {
  const arr = [];
  lists.map((book) => {
    arr.push(book[field])
  })
  return arr.join(", ");
}

function compare(a, condition, b) {
  switch (condition) {
    case ">":
      return a > b;
    case "<":
      return a < b;
    case ">=":
      return a >= b;
    case "<=":
      return a <= b;
    case "=":
      return a == b;
    default:
      return;
  }
}

function getRooms(hotel) {
  let rooms = [];
  for (let i = 1; i <= hotel.floor; i++) {
    for (let j = 1; j <= hotel.roomPerFloor; j++) {
      rooms.push(i + minTwoDigits(j));
    }
  }
  return rooms;
}

function minTwoDigits(n) {
  return (n < 10 ? '0' : '') + n;
}

function getCommandsFromFileName(fileName) {
  const file = fs.readFileSync(fileName, 'utf-8')

  return file
    .split('\n')
    .map(line => line.split(' '))
    .map(
      ([commandName, ...params]) =>
        new Command(
          commandName,
          params.map(param => {
            const parsedParam = parseInt(param, 10)

            return Number.isNaN(parsedParam) ? param : parsedParam
          })
        )
    )
}

main()
