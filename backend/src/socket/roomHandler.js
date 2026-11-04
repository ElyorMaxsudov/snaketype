const { getRandomWords } = require('../data/wordLists');

const rooms = new Map(); // Xotiradagi real-time xonalar

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Yangi ulanish: ${socket.id}`);

    // Dastlabki mavjud xonalar ro'yxatini yuborish
    socket.emit('rooms:list_update', getPublicRooms());

    // Xona yaratish
    socket.on('room:create', ({ roomName, mode, language, user }) => {
      try {
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Agar user berilmagan bo'lsa Mehmon yaratish
        const safeUser = user && user.username ? user : {
          _id: socket.id,
          username: `Mehmon_${Math.floor(1000 + Math.random() * 9000)}`,
          ism: 'Mehmon',
          familya: 'O\'yinchi',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${socket.id}`,
          level: 1,
        };

        const roomLang = language || 'uzbek_latin';
        const text = getRandomWords(roomLang, mode?.includes('words') ? 30 : 35);

        const newRoom = {
          roomCode,
          name: roomName || `${safeUser.username} poygasi`,
          hostId: safeUser._id || socket.id,
          hostUsername: safeUser.username,
          mode: mode || 'time 30',
          language: roomLang,
          text,
          status: 'waiting', // waiting, countdown, racing, finished
          players: [
            {
              socketId: socket.id,
              userId: safeUser._id,
              username: safeUser.username,
              ism: safeUser.ism,
              familya: safeUser.familya,
              avatar: safeUser.avatar,
              level: safeUser.level || 1,
              progress: 0,
              wpm: 0,
              accuracy: 100,
              finished: false,
              rank: null,
            },
          ],
          messages: [
            {
              sender: 'Tizim',
              text: `Xona yaratildi! Xona kodi: ${roomCode}. Do'stlaringizga yuboring!`,
              createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSystem: true,
            },
          ],
        };

        rooms.set(roomCode, newRoom);
        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.user = safeUser;

        socket.emit('room:created', newRoom);
        io.emit('rooms:list_update', getPublicRooms());
        console.log(`✅ Xona yaratildi: ${roomCode} (${safeUser.username})`);
      } catch (error) {
        console.error('room:create error:', error);
        socket.emit('room:error', { message: 'Xona yaratishda xatolik yuz berdi' });
      }
    });

    // Xonaga qo'shilish
    socket.on('room:join', ({ roomCode, user }) => {
      const code = roomCode?.toUpperCase()?.trim();
      const room = rooms.get(code);

      if (!room) {
        return socket.emit('room:error', { message: `"${code}" kodli xona topilmadi yoki yopilgan` });
      }

      if (room.status === 'racing') {
        return socket.emit('room:error', { message: 'Xonada poyga allaqachon ketmoqda, kuting yoki boshqa xonaga kiring' });
      }

      const safeUser = user && user.username ? user : {
        _id: socket.id,
        username: `Mehmon_${Math.floor(1000 + Math.random() * 9000)}`,
        ism: 'Mehmon',
        familya: 'O\'yinchi',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${socket.id}`,
        level: 1,
      };

      // O'yinchi xonada bormi?
      const existingPlayerIndex = room.players.findIndex(
        (p) => (safeUser._id && p.userId === safeUser._id) || p.username === safeUser.username
      );

      if (existingPlayerIndex !== -1) {
        room.players[existingPlayerIndex].socketId = socket.id;
      } else {
        room.players.push({
          socketId: socket.id,
          userId: safeUser._id,
          username: safeUser.username,
          ism: safeUser.ism,
          familya: safeUser.familya,
          avatar: safeUser.avatar,
          level: safeUser.level || 1,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          finished: false,
          rank: null,
        });

        const joinMsg = {
          sender: 'Tizim',
          text: `${safeUser.username} xonaga qo'shildi!`,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true,
        };
        room.messages.push(joinMsg);
        io.to(code).emit('room:new_message', joinMsg);
      }

      socket.join(code);
      socket.roomCode = code;
      socket.user = safeUser;

      socket.emit('room:joined', room);
      io.to(code).emit('room:updated', room);
      io.emit('rooms:list_update', getPublicRooms());
      console.log(`👤 ${safeUser.username} xonaga kirdi: ${code}`);
    });

    // Xonada poygani boshlash
    socket.on('room:start_race', ({ roomCode }) => {
      const code = roomCode?.toUpperCase();
      const room = rooms.get(code);

      if (!room) return;

      if (room.status === 'racing' || room.status === 'countdown') return;

      room.status = 'countdown';
      // Barcha o'yinchilar statistikasini nollash
      room.players.forEach((p) => {
        p.progress = 0;
        p.wpm = 0;
        p.accuracy = 100;
        p.finished = false;
        p.rank = null;
      });

      // Barcha o'yinchilarga bir xil yangi matn berish
      room.text = getRandomWords(room.language, 30);

      io.to(code).emit('room:countdown', { seconds: 3, room });

      setTimeout(() => {
        if (rooms.has(code)) {
          room.status = 'racing';
          room.startTime = Date.now();
          io.to(code).emit('room:race_started', room);
          io.emit('rooms:list_update', getPublicRooms());
        }
      }, 3000);
    });

    // Jonli yozish progressi (harflar soni va WPM)
    socket.on('room:progress_update', ({ roomCode, progress, wpm, accuracy }) => {
      const room = rooms.get(roomCode?.toUpperCase());
      if (!room || room.status !== 'racing') return;

      const player = room.players.find((p) => p.socketId === socket.id);
      if (player) {
        player.progress = Math.min(100, Math.max(0, Math.round(progress)));
        player.wpm = Math.round(wpm || 0);
        player.accuracy = Math.round(accuracy || 100);

        // Xonadagi boshqa barcha o'yinchilarga jonli uzatish
        socket.to(room.roomCode).emit('room:player_progress', {
          socketId: socket.id,
          username: player.username,
          progress: player.progress,
          wpm: player.wpm,
          accuracy: player.accuracy,
        });
      }
    });

    // O'yinchi marraga yetib keldi (Finished)
    socket.on('room:player_finished', ({ roomCode, wpm, accuracy, timeTaken }) => {
      const room = rooms.get(roomCode?.toUpperCase());
      if (!room) return;

      const player = room.players.find((p) => p.socketId === socket.id);
      if (player && !player.finished) {
        player.finished = true;
        player.progress = 100;
        player.wpm = Math.round(wpm);
        player.accuracy = Math.round(accuracy);
        player.timeTaken = timeTaken;

        // O'rin (rank)
        const finishedCount = room.players.filter((p) => p.finished).length;
        player.rank = finishedCount;

        io.to(room.roomCode).emit('room:player_finished_announcement', {
          player,
          rank: player.rank,
        });

        const finishMsg = {
          sender: 'Tizim',
          text: `🎉 ${player.username} marraga ${player.rank}-o'rinda yetib keldi! (${player.wpm} WPM)`,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true,
        };
        room.messages.push(finishMsg);
        io.to(room.roomCode).emit('room:new_message', finishMsg);

        // Agar hamma tugatgan bo'lsa
        const allFinished = room.players.every((p) => p.finished);
        if (allFinished) {
          room.status = 'finished';
          io.to(room.roomCode).emit('room:race_finished', room);
          io.emit('rooms:list_update', getPublicRooms());
        }
      }
    });

    // Jonli chat xabari
    socket.on('room:send_message', ({ roomCode, text }) => {
      const room = rooms.get(roomCode?.toUpperCase());
      if (!room || !text?.trim()) return;

      const message = {
        sender: socket.user?.username || 'Mehmon',
        avatar: socket.user?.avatar,
        text: text.trim(),
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: false,
      };

      room.messages.push(message);
      if (room.messages.length > 50) room.messages.shift();

      io.to(room.roomCode).emit('room:new_message', message);
    });

    // Xonadan chiqish
    socket.on('room:leave', () => {
      handleUserLeave(socket, io);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Ulanish uzildi: ${socket.id}`);
      handleUserLeave(socket, io);
    });
  });

  function handleUserLeave(socket, io) {
    if (!socket.roomCode) return;
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    room.players = room.players.filter((p) => p.socketId !== socket.id);

    if (room.players.length === 0) {
      rooms.delete(socket.roomCode);
      console.log(`🗑️ Xona o'chirildi (bo'sh): ${socket.roomCode}`);
    } else {
      if (room.hostId === socket.user?._id || room.players[0]) {
        room.hostId = room.players[0].userId;
        room.hostUsername = room.players[0].username;
      }

      const leaveMsg = {
        sender: 'Tizim',
        text: `${socket.user?.username || 'O\'yinchi'} xonani tark etdi`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      };
      room.messages.push(leaveMsg);
      io.to(socket.roomCode).emit('room:new_message', leaveMsg);
      io.to(socket.roomCode).emit('room:updated', room);
    }

    socket.leave(socket.roomCode);
    socket.roomCode = null;
    io.emit('rooms:list_update', getPublicRooms());
  }

  function getPublicRooms() {
    const list = [];
    for (const [code, r] of rooms.entries()) {
      list.push({
        roomCode: code,
        name: r.name,
        hostUsername: r.hostUsername,
        mode: r.mode,
        language: r.language,
        playerCount: r.players.length,
        status: r.status,
      });
    }
    return list;
  }
};
