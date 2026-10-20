'use strict';
// Quick visual check: screenshots of the main screens.
module.exports = async (H) => {
  const go = async (hash, wait = 600) => {
    await H.js(`location.hash = ${JSON.stringify(hash)}`);
    await H.sleep(wait);
  };
  await H.shot('01-home');
  await go('#/exams');
  await H.shot('02-exams');
  await go('#/exam/2023-maj');
  await H.shot('03-exam');
  await go('#/t/2023-maj/1.1?from=exam', 1500);
  await H.shot('04-task-fill');
  await go('#/t/2023-maj/2.2?from=exam', 2500);
  await H.shot('05-task-program');
  await go('#/t/2023-maj/7.2?from=exam', 2500);
  await H.shot('06-task-sql');
  await go('#/t/2023-maj/6.1?from=exam', 3000);
  await H.shot('07-task-sheet');
  await go('#/t/2023-maj/2.1?from=exam', 2000);
  await H.shot('08-task-algo');
};
