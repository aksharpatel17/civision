'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'
import data from '../public/database.json'

interface SkiPass {
  id: number;
  saison: string;
  prix: number;
  age: number;
  niveau: string;
  compte: boolean;
  passe: string;
}

const skiPassData: SkiPass[] = data

interface ChartData {
  name: string;
  value: number;
}

interface GroupedBarChartData {
  saison: string;
  simple: number;
  double: number;
  illimité: number;
}


export default function Dashboard() {
  const [selectedSeason, setSelectedSeason] = useState<string>('all')
  const [filteredData, setFilteredData] = useState<SkiPass[]>(skiPassData)
  const [averagePrice, setAveragePrice] = useState<number>(0)

  useEffect(() => {
    const newFilteredData = selectedSeason === 'all' 
      ? skiPassData 
      : skiPassData.filter(item => item.saison === selectedSeason)
    
    setFilteredData(newFilteredData)
    setAveragePrice(calculateAveragePrice(newFilteredData))
  }, [selectedSeason])

  const calculateAveragePrice = (data: SkiPass[]): number => {
    const total = data.reduce((sum, item) => sum + item.prix, 0)
    return Number((total / data.length).toFixed(2))
  }

  const prepareChartData = (data: SkiPass[], key: keyof SkiPass): ChartData[] => {
    return Object.entries(
      data.reduce((acc: Record<string, number>, item) => {
        const value = item[key] as string
        acc[value] = (acc[value] || 0) + 1
        return acc
      }, {})
    ).map(([name, value]) => ({ name, value }))
  }

  const prepareGroupedBarChartData = (): GroupedBarChartData[] => {
    const groupedData = skiPassData.reduce((acc: Record<string, Record<string, number[]>>, item) => {
      if (!acc[item.saison]) {
        acc[item.saison] = { simple: [], double: [], illimité: [] }
      }
      if (item.passe === 'simple' || item.passe === 'double' || item.passe === 'illimité') {
        acc[item.saison][item.passe].push(item.prix)
      }
      return acc
    }, {})

    return Object.entries(groupedData).map(([saison, passeData]) => ({
      saison,
      simple: passeData.simple.length ? Number((passeData.simple.reduce((a, b) => a + b, 0) / passeData.simple.length).toFixed(2)) : 0,
      double: passeData.double.length ? Number((passeData.double.reduce((a, b) => a + b, 0) / passeData.double.length).toFixed(2)) : 0,
      illimité: passeData.illimité.length ? Number((passeData.illimité.reduce((a, b) => a + b, 0) / passeData.illimité.length).toFixed(2)) : 0,
    }))
  }

  

  const levelData = prepareChartData(filteredData, 'niveau')
  const groupedBarChartData = prepareGroupedBarChartData()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Civision Ski Pass Dashboard</h1>
      
      <Card className="mb-4">
        <CardContent className="pt-6">
          <Select onValueChange={setSelectedSeason} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              <SelectItem value="été">Summer</SelectItem>
              <SelectItem value="automne">Autumn</SelectItem>
              <SelectItem value="hiver">Winter</SelectItem>
              <SelectItem value="printemps">Spring</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Average Price</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">${averagePrice}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Skill Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={levelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      

        <Card>
          <CardHeader>
            <CardTitle>Average Price by Season and Pass Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={groupedBarChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="saison" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="simple" fill="#8884d8" />
                <Bar dataKey="double" fill="#82ca9d" />
                <Bar dataKey="illimité" fill="#ffc658" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

       
      </div>
    </div>
  )
}




