package com.bustrack

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            BusTrackApp()
        }
    }
}

@Composable
fun BusTrackApp() {
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF4F7FB))
                .padding(24.dp)
        ) {
            Text(
                text = "BusTrack Driver",
                style = MaterialTheme.typography.headlineMedium
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(text = "Trip: Chennai → Madurai")
            Text(text = "Status: In transit")
            Text(text = "GPS: 13.0827, 80.2707")
            Text(text = "Speed: 64 km/h")

            Spacer(modifier = Modifier.height(24.dp))

            Button(onClick = { /* start trip */ }) {
                Text("Start Trip")
            }

            Spacer(modifier = Modifier.height(12.dp))

            Button(onClick = { /* end trip */ }) {
                Text("End Trip")
            }
        }
    }
}
