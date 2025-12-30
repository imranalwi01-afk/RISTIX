
const hash = await Bun.password.hash('12345678', {
    algorithm: 'bcrypt',
    cost: 10,
});
console.log(hash);
