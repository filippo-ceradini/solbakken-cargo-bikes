// const uniqueString = uuidv4() + _id;
// // mail options
// const mailOptions = {
//     from: process.env.AUTH_EMAIL,
//     to: email,
//     subject: "Verify Your Email",
//     html: `<p>Verify your email address to complete the signup and login into your account.</p><p>This link
// <b>expires in 6 hours</b>.</p><p>Press <a href=${
//         currentUrl + "user/verify/" + _id + "/" + uniqueString
//     }>here</a> to proceed.</p>`,
// };
// //hash the uniqueString
// const salt Rounds = 10;
// bcrypt
//     .hash (uniqueString, saltRounds)
//     .then((hashedUniqueString) => {
// // set values in userVerification collection
//         const newVerification = new UserVerification ({
//             userId: _id,
//             uniqueString: hashedUniqueString,
//             createdAt: Date.now(),
//         })
//     })
//     .catch(() => {
//         res.json ({
//             status: "FAILED",
//             message: "An error occurred while hashing email data!",
//         });
//     })