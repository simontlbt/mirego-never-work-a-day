export async function getMoments() {
  return await (
    await fetch("https://api.neverworkaday.com/organizations/mirego/moments")
  ).json();
}

export async function getMoment(id) {
  return await (
    await fetch(`https://api.neverworkaday.com/moments/${id}`)
  ).json();
}
