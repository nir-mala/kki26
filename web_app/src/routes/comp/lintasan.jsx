import React, { useState, useEffect } from 'react'

const InfoCard = ({ title, value }) => {
  return (
    <div>
      <div className="bg-slate-300 rounded-lg text-center font-medium">
        {title}
      </div>

      <div className="bg-slate-50 p-1 rounded-lg mt-2 text-sm font-bold text-center">
        {value}
      </div>
    </div>
  )
}

const Lintasan = ({ namaLintasan, children }) => {
  const [latestData, setLatestData] = useState(null)
  const [logData, setLogData] = useState([])
  const [isTracking, setIsTracking] = useState(false)

  // =========================================================
  // CLOUDFLARE TUNNEL - IMAGE
  // =========================================================

  const CLOUDFLARE_IMAGE_URL =
    'https://necklace-environmental-missing-tells.trycloudflare.com'

  const FALLBACK_SURFACE = '/surface.jpg'
  const FALLBACK_UNDERWATER = '/underwater.jpg'

  // Timestamp untuk memaksa browser mengambil gambar terbaru
  const [imageTimestamp, setImageTimestamp] = useState(Date.now())

  // Update timestamp setiap 3 detik
  useEffect(() => {
    const imageInterval = setInterval(() => {
      setImageTimestamp(Date.now())
    }, 3000)

    return () => clearInterval(imageInterval)
  }, [])

  // URL gambar dari Cloudflare
  const surfaceSrc =
    `${CLOUDFLARE_IMAGE_URL}/sbox1.jpg?t=${imageTimestamp}`

  const underwaterSrc =
    `${CLOUDFLARE_IMAGE_URL}/ubox1.jpg?t=${imageTimestamp}`

  // =========================================================
  // VIDEO STREAMING ROS
  // =========================================================

  const STREAM_URL =
    'https://avoid-experimental-mistress-hydraulic.trycloudflare.com/stream?topic=/camera1/image&type=ros_compressed'

  const [videoSrc, setVideoSrc] = useState(STREAM_URL)
  const [isVideoError, setIsVideoError] = useState(false)

  const handleRetryVideo = () => {
    setIsVideoError(false)

    // Tambahkan timestamp agar browser mencoba koneksi ulang
    setVideoSrc(
      `${STREAM_URL}&t=${new Date().getTime()}`
    )
  }

  // =========================================================
  // BACK4APP
  // =========================================================

  const BACK4APP_HEADERS = {
    'X-Parse-Application-Id':
      'AtYwaafZCgXGTUGpl7xnXWGyyvv6eJqEoBDt5ioD',

    'X-Parse-REST-API-Key':
      'xqdjXlmQBXv1sE6nhBma8X6X77jW8e78dvR1vjMX',
  }

  // =========================================================
  // FETCH DATA DARI BACK4APP
  // =========================================================

  const fetchData = () => {
    fetch(
      'https://parseapi.back4app.com/classes/database?order=-createdAt&limit=1',
      {
        headers: BACK4APP_HEADERS,
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results.length > 0) {
          const item = data.results[0]

          // Konversi data menjadi Number
          const parsedItem = {
            ...item,

            x:
              item.x !== undefined
                ? Number(item.x)
                : 0,

            y:
              item.y !== undefined
                ? Number(item.y)
                : 0,

            SOG_Knot:
              item.SOG_Knot !== undefined
                ? Number(item.SOG_Knot)
                : 0,

            SOG_kmperhours:
              item.SOG_kmperhours !== undefined
                ? Number(item.SOG_kmperhours)
                : 0,

            COG:
              item.COG !== undefined
                ? Number(item.COG)
                : 0,

            Lattitude:
              item.Lattitude !== undefined
                ? Number(item.Lattitude)
                : 0,

            Longitude:
              item.Longitude !== undefined
                ? Number(item.Longitude)
                : 0,

            code: item.code || null,
          }

          setLatestData(parsedItem)

          // =================================================
          // RESET TRAJECTORY & LOG
          // JIKA CODE = "0125"
          // =================================================

          if (parsedItem.code === '0125') {
            setLogData([parsedItem])
          } else {
            setLogData((prevLogs) => {
              const isExist = prevLogs.some(
                (log) =>
                  log.objectId === parsedItem.objectId
              )

              if (isExist) {
                return prevLogs
              }

              return [parsedItem, ...prevLogs]
            })
          }
        }
      })
      .catch((err) => {
        console.error(
          'Gagal mengambil data dari Back4app:',
          err.message
        )
      })
  }

  // =========================================================
  // START / STOP TRACKING
  // =========================================================

  const handleToggleTracking = () => {
    if (!isTracking) {
      setLogData([])
      setLatestData(null)
    }

    setIsTracking(!isTracking)
  }

  // =========================================================
  // POLLING BACK4APP SETIAP 1 DETIK
  // =========================================================

  useEffect(() => {
    let interval = null

    if (isTracking) {
      fetchData()

      interval = setInterval(() => {
        fetchData()
      }, 1000)
    } else {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [isTracking])

  // =========================================================
  // INFORMATION CARD
  // =========================================================

  const items = [
    {
      title: 'DAY',
      value: latestData?.Day ?? '-',
    },

    {
      title: 'DATE',
      value: latestData?.Date ?? '-',
    },

    {
      title: 'TIME',
      value: latestData?.Time ?? '-',
    },

    {
      title: 'POSITION LOG [X,Y]',
      value:
        latestData?.x !== undefined &&
        latestData?.y !== undefined
          ? `[${latestData.x.toFixed(1)}, ${latestData.y.toFixed(1)}]`
          : '-',
    },

    {
      title: 'SOG [KNOT]',
      value:
        latestData?.SOG_Knot != null
          ? latestData.SOG_Knot.toFixed(2)
          : '-',
    },

    {
      title: 'SOG [KM/H]',
      value:
        latestData?.SOG_kmperhours != null
          ? latestData.SOG_kmperhours.toFixed(2)
          : '-',
    },

    {
      title: 'COORDINATE',
      value:
        latestData?.Lattitude &&
        latestData?.Longitude
          ? `${latestData.Lattitude.toFixed(4)}, ${latestData.Longitude.toFixed(4)}`
          : '-',
    },

    {
      title: 'COG',
      value:
        latestData?.COG != null
          ? latestData.COG.toFixed(2)
          : '-',
    },
  ]

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 w-full p-5">

      {/* TITLE */}

      <h1 className="text-4xl font-bold text-black text-center mb-2">
        {namaLintasan}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6">

        {/* =================================================
            KOLOM 1
        ================================================= */}

        <div className="bg-white p-5 rounded-xl shadow">

          {/* START / STOP */}

          <div className="flex justify-center mb-6">

            <button
              onClick={handleToggleTracking}
              className={`px-8 py-3 rounded-lg font-bold text-white shadow-md transition-all duration-300 ${
                isTracking
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isTracking ? 'STOP' : 'START'}
            </button>

          </div>

          {/* =================================================
              GEO TAG INFO
          ================================================= */}

          <h2 className="text-xl font-semibold mb-4 bg-blue-500 text-white py-3 rounded-lg text-center w-full">
            Geo - Tag Info
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

            {items.map((item, index) => (
              <InfoCard
                key={index}
                title={item.title}
                value={item.value}
              />
            ))}

          </div>

          {/* =================================================
              IMAGE
          ================================================= */}

          <div>

            <h2 className="text-xl font-semibold mb-4 mt-4 bg-blue-500 text-white py-3 rounded-lg text-center w-full">
              IMAGE
            </h2>

            <div className="grid grid-cols-2 gap-4 mt-4">

              {/* SURFACE */}

              <div className="flex flex-col">

                <div className="flex-1">

                  <img
                    src={surfaceSrc}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src =
                        FALLBACK_SURFACE
                    }}
                    alt="Surface Box"
                    className="w-full h-80 object-contain bg-slate-100 rounded-lg"
                  />

                </div>

                <h3 className="text-center bg-slate-200 rounded-lg py-2 font-semibold mt-2">
                  Surface
                </h3>

              </div>

              {/* UNDERWATER */}

              <div className="flex flex-col">

                <div className="flex-1">

                  <img
                    src={underwaterSrc}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src =
                        FALLBACK_UNDERWATER
                    }}
                    alt="Underwater Box"
                    className="w-full h-80 object-contain bg-slate-100 rounded-lg"
                  />

                </div>

                <h3 className="text-center bg-slate-200 rounded-lg py-2 font-semibold mt-2">
                  Underwater
                </h3>

              </div>

            </div>

          </div>

          {/* =================================================
              POSITION LOG
          ================================================= */}

          <h2 className="text-xl font-semibold mb-4 mt-4 bg-blue-500 text-white py-3 rounded-lg text-center w-full">
            POSITION LOG
          </h2>

          <div className="overflow-x-auto max-h-[250px] border border-slate-200 rounded-lg shadow-sm mt-4">

            <table className="min-w-full bg-white text-left border-collapse">

              <thead className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase sticky top-0 border-b border-slate-200 z-10">

                <tr>

                  <th className="px-3 py-2.5">
                    TIME
                  </th>

                  <th className="px-3 py-2.5">
                    POSITION [X,Y]
                  </th>

                  <th className="px-3 py-2.5">
                    SOG [KNOT]
                  </th>

                  <th className="px-3 py-2.5">
                    SOG [KM/H]
                  </th>

                  <th className="px-3 py-2.5">
                    LAT, LONG
                  </th>

                  <th className="px-3 py-2.5">
                    COG
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">

                {logData.length > 0 ? (

                  logData.map((log) => (

                    <tr
                      key={log.objectId}
                      className="hover:bg-slate-50 transition-colors"
                    >

                      <td className="px-3 py-2">
                        {log.Time}
                      </td>

                      <td className="px-3 py-2">
                        [{log.x?.toFixed(1)}, {log.y?.toFixed(1)}]
                      </td>

                      <td className="px-3 py-2">
                        {log.SOG_Knot?.toFixed(2)}
                      </td>

                      <td className="px-3 py-2">
                        {log.SOG_kmperhours?.toFixed(2)}
                      </td>

                      <td className="px-3 py-2">
                        {log.Lattitude?.toFixed(4)}, {log.Longitude?.toFixed(4)}
                      </td>

                      <td className="px-3 py-2">
                        {log.COG?.toFixed(2)}
                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-4 text-slate-400"
                    >
                      {isTracking
                        ? 'Menunggu data lintasan baru...'
                        : 'Tekan START untuk merekam lintasan'}
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* =================================================
            KOLOM 2
        ================================================= */}

        <div className="bg-white p-5 rounded-xl shadow flex flex-col">

          {/* =================================================
              VIDEO STREAMING
          ================================================= */}

          <div className="mb-6">

            <h2 className="text-xl font-semibold mb-4 bg-blue-500 text-white py-3 rounded-lg text-center w-full">
              VIDEO STREAMING
            </h2>

            <div className="w-full h-64 bg-slate-900 rounded-lg flex items-center justify-center text-white relative overflow-hidden">

              {!isVideoError ? (

                <img
                  src={videoSrc}
                  alt="Live Camera Feed"
                  className="w-full h-full object-contain"
                  onError={() => setIsVideoError(true)}
                  onLoad={() => setIsVideoError(false)}
                />

              ) : (

                <div className="flex flex-col items-center justify-center p-4 text-center">

                  <span className="text-red-400 font-medium mb-1">
                    Gagal terhubung ke Kamera
                  </span>

                  <button
                    onClick={handleRetryVideo}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow transition-colors"
                  >
                    Coba Hubungkan Ulang
                  </button>

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              CHECKPOINT + TRAJECTORY
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">

            {/* CHECKPOINT */}

            <div className="md:col-span-1 flex flex-col">

              <h2 className="text-xl font-semibold mb-4 bg-blue-500 text-white py-3 rounded-lg text-center w-full">
                CHECKPOINT
              </h2>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex-1 overflow-y-auto">

                <p className="text-xs text-slate-500 text-center">
                  Detail Checkpoint...
                </p>

              </div>

            </div>

            {/* TRAJECTORY */}

            <div className="md:col-span-3 flex flex-col overflow-hidden">

              <h2 className="text-xl font-semibold mb-4 bg-blue-500 text-white py-3 rounded-lg text-center w-full">
                TRAJECTORY
              </h2>

              <div className="flex justify-center items-center flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-hidden w-full relative">

                {React.Children.map(
                  children,
                  (child) => {

                    if (React.isValidElement(child)) {

                      return React.cloneElement(
                        child,
                        {
                          pointsData: logData,
                        }
                      )

                    }

                    return child

                  }
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Lintasan